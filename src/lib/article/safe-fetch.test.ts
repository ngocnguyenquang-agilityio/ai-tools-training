/**
 * @jest-environment node
 */
import http from "node:http";
import type { AddressInfo } from "node:net";

import {
  ArticleFetchError,
  fetchArticleHtml,
  isPublicAddress,
  MAX_ARTICLE_BYTES,
  MAX_REDIRECTS,
  nodeTransport,
  type FetchDeps,
  type TransportResponse,
} from "./safe-fetch";

jest.mock("server-only", () => ({}));

const PUBLIC_V4 = "93.184.216.34";

async function* chunks(...parts: (string | Buffer)[]) {
  for (const part of parts) yield Buffer.from(part);
}

function htmlResponse(
  html: string,
  headers: Record<string, string> = {},
): TransportResponse {
  return {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
    body: chunks(html),
  };
}

function redirectTo(location: string): TransportResponse {
  return { status: 302, headers: { location }, body: chunks() };
}

/** A resolver that maps host names to addresses; unknown hosts don't exist. */
function resolver(hosts: Record<string, string[]>): FetchDeps["resolve"] {
  return async (hostname) => {
    const addresses = hosts[hostname];
    if (!addresses) throw new Error(`getaddrinfo ENOTFOUND ${hostname}`);
    return addresses.map((address) => ({
      address,
      family: address.includes(":") ? 6 : 4,
    }));
  };
}

describe("isPublicAddress", () => {
  it.each([
    ["a public IPv4 address", "8.8.8.8"],
    ["another public IPv4 address", PUBLIC_V4],
    ["a public IPv6 address", "2606:4700:4700::1111"],
  ])("accepts %s", (_label, address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it.each([
    ["loopback", "127.0.0.1"],
    ["the unspecified address", "0.0.0.0"],
    ["a 10.x private address", "10.0.0.5"],
    ["the start of 172.16/12", "172.16.0.1"],
    ["the end of 172.16/12", "172.31.255.255"],
    ["a 192.168.x private address", "192.168.1.1"],
    ["the cloud metadata address", "169.254.169.254"],
    ["carrier-grade NAT", "100.64.0.1"],
    ["multicast", "224.0.0.1"],
    ["broadcast", "255.255.255.255"],
    ["IPv6 loopback", "::1"],
    ["the IPv6 unspecified address", "::"],
    ["an IPv6 link-local address", "fe80::1"],
    ["an IPv6 unique-local address", "fd12:3456:789a::1"],
    ["an IPv4-mapped loopback", "::ffff:127.0.0.1"],
    ["an IPv4-mapped loopback in hex", "::ffff:7f00:1"],
    ["a 6to4 address embedding loopback", "2002:7f00:1::1"],
    ["a Teredo address", "2001:0:4136:e378:8000:63bf:3fff:fdd2"],
    ["an IPv6 documentation address", "2001:db8::1"],
    ["a deprecated IPv6 site-local address", "fec0::1"],
    ["something that is not an IP address", "example.com"],
  ])("rejects %s", (_label, address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});

describe("fetchArticleHtml", () => {
  it("returns the page's HTML and connects to the address it validated", async () => {
    const transport = jest.fn().mockResolvedValue(htmlResponse("<p>Hi</p>"));

    const html = await fetchArticleHtml("https://example.com/post", {
      resolve: resolver({ "example.com": [PUBLIC_V4] }),
      transport,
    });

    expect(html).toBe("<p>Hi</p>");
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({
        url: new URL("https://example.com/post"),
        address: PUBLIC_V4,
        family: 4,
      }),
    );
  });

  it("decodes the charset named in the content type", async () => {
    const latin1 = Buffer.from([0x63, 0x61, 0x66, 0xe9]);
    const transport = jest.fn().mockResolvedValue({
      status: 200,
      headers: { "content-type": "text/html; charset=iso-8859-1" },
      body: chunks(latin1),
    });

    const html = await fetchArticleHtml("https://example.com/", {
      resolve: resolver({ "example.com": [PUBLIC_V4] }),
      transport,
    });

    expect(html).toBe("café");
  });

  it.each([
    ["a file URL", "file:///etc/passwd"],
    ["an ftp URL", "ftp://example.com/a"],
    ["a javascript URL", "javascript:alert(1)"],
    ["a URL with credentials", "https://user:pass@example.com/"],
    ["text that is not a URL", "not a url"],
  ])("refuses %s without resolving or connecting", async (_label, url) => {
    const resolve = jest.fn();
    const transport = jest.fn();

    await expect(
      fetchArticleHtml(url, { resolve, transport }),
    ).rejects.toMatchObject({ kind: "blocked" });

    expect(resolve).not.toHaveBeenCalled();
    expect(transport).not.toHaveBeenCalled();
  });

  it.each([
    ["an IP literal for loopback", "http://127.0.0.1/admin", "127.0.0.1"],
    ["a decimal-encoded loopback", "http://2130706433/", "127.0.0.1"],
    [
      "the metadata address",
      "http://169.254.169.254/latest",
      "169.254.169.254",
    ],
    ["an IPv6 loopback literal", "http://[::1]/", "::1"],
  ])("refuses %s", async (_label, url, address) => {
    const transport = jest.fn();

    await expect(
      fetchArticleHtml(url, {
        resolve: async () => [
          { address, family: address.includes(":") ? 6 : 4 },
        ],
        transport,
      }),
    ).rejects.toMatchObject({ kind: "blocked" });

    expect(transport).not.toHaveBeenCalled();
  });

  it("refuses a host with any private address, even if another is public", async () => {
    const transport = jest.fn();

    await expect(
      fetchArticleHtml("https://mixed.example/", {
        resolve: resolver({ "mixed.example": [PUBLIC_V4, "10.0.0.7"] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "blocked" });

    expect(transport).not.toHaveBeenCalled();
  });

  it("follows a relative redirect and reads the final page", async () => {
    const transport = jest
      .fn()
      .mockResolvedValueOnce(redirectTo("/moved"))
      .mockResolvedValueOnce(htmlResponse("<p>Moved</p>"));

    const html = await fetchArticleHtml("https://example.com/old", {
      resolve: resolver({ "example.com": [PUBLIC_V4] }),
      transport,
    });

    expect(html).toBe("<p>Moved</p>");
    expect(transport.mock.calls[1][0].url).toEqual(
      new URL("https://example.com/moved"),
    );
  });

  it("checks the address again at every redirect hop", async () => {
    const transport = jest
      .fn()
      .mockResolvedValueOnce(redirectTo("http://internal.example/secret"));

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({
          "example.com": [PUBLIC_V4],
          "internal.example": ["192.168.0.10"],
        }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "blocked" });

    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("refuses a redirect to a non-web scheme", async () => {
    const transport = jest
      .fn()
      .mockResolvedValueOnce(redirectTo("file:///etc/passwd"));

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "blocked" });
  });

  it("gives up after the redirect limit", async () => {
    const transport = jest
      .fn()
      .mockImplementation(async () => redirectTo("/again"));

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "too-many-redirects" });

    // The first request plus MAX_REDIRECTS followed redirects.
    expect(transport).toHaveBeenCalledTimes(MAX_REDIRECTS + 1);
  });

  it("fails on a redirect without a Location header", async () => {
    const transport = jest
      .fn()
      .mockResolvedValue({ status: 302, headers: {}, body: chunks() });

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "failed" });
  });

  it.each([
    ["a 404", 404],
    ["a 500", 500],
  ])("fails on %s", async (_label, status) => {
    const transport = jest
      .fn()
      .mockResolvedValue({ status, headers: {}, body: chunks("nope") });

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "failed" });
  });

  it.each([
    ["a PDF", { "content-type": "application/pdf" }],
    ["a JSON response", { "content-type": "application/json" }],
    ["a response with no content type", {}],
    [
      "a compressed response",
      { "content-type": "text/html", "content-encoding": "gzip" },
    ],
  ])("refuses %s", async (_label, headers) => {
    const transport = jest
      .fn()
      .mockResolvedValue({ status: 200, headers, body: chunks("x") });

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "unsupported" });
  });

  it("refuses a page that declares more than the size cap, without reading it", async () => {
    const body = chunks("<p>never read</p>");
    const next = jest.spyOn(body, "next");
    const transport = jest.fn().mockResolvedValue({
      status: 200,
      headers: {
        "content-type": "text/html",
        "content-length": String(MAX_ARTICLE_BYTES + 1),
      },
      body,
    });

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "too-large" });

    expect(next).not.toHaveBeenCalled();
  });

  it("stops reading a streamed page once it passes the size cap", async () => {
    const big = Buffer.alloc(MAX_ARTICLE_BYTES / 2 + 1, "a");
    const transport = jest.fn().mockResolvedValue({
      status: 200,
      headers: { "content-type": "text/html" },
      body: chunks(big, big, big),
    });

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
      }),
    ).rejects.toMatchObject({ kind: "too-large" });
  });

  it("times out a server that never answers", async () => {
    const transport = jest.fn(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise<TransportResponse>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        }),
    );

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
        timeoutMs: 10,
      }),
    ).rejects.toMatchObject({ kind: "timeout" });
  });

  it("times out a DNS lookup that never answers", async () => {
    const transport = jest.fn();

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: () => new Promise(() => {}),
        transport,
        timeoutMs: 10,
      }),
    ).rejects.toMatchObject({ kind: "timeout" });

    expect(transport).not.toHaveBeenCalled();
  });

  it("times out a server that stalls while sending the page", async () => {
    const transport = jest.fn(async ({ signal }: { signal: AbortSignal }) => ({
      status: 200,
      headers: { "content-type": "text/html" },
      body: (async function* () {
        yield Buffer.from("<p>start");
        await new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        });
      })(),
    }));

    await expect(
      fetchArticleHtml("https://example.com/", {
        resolve: resolver({ "example.com": [PUBLIC_V4] }),
        transport,
        timeoutMs: 10,
      }),
    ).rejects.toMatchObject({ kind: "timeout" });
  });

  it.each([
    ["a page", () => htmlResponse("<p>Hi</p>")],
    ["a redirect", () => redirectTo("/moved")],
    [
      "an error status",
      (): TransportResponse => ({ ...htmlResponse(""), status: 404 }),
    ],
    [
      "a PDF",
      (): TransportResponse => ({
        ...htmlResponse(""),
        headers: { "content-type": "application/pdf" },
      }),
    ],
  ])("closes the connection after %s", async (_label, respond) => {
    const close = jest.fn();
    // The redirect leads to a page, so the fetch ends either way.
    const transport = jest
      .fn()
      .mockResolvedValueOnce({ ...respond(), close })
      .mockResolvedValue({ ...htmlResponse("<p>Hi</p>"), close });

    await fetchArticleHtml("https://example.com/", {
      resolve: resolver({ "example.com": [PUBLIC_V4] }),
      transport,
    }).catch(() => {});

    expect(close).toHaveBeenCalledTimes(transport.mock.calls.length);
  });

  it("fails when the host name doesn't resolve", async () => {
    await expect(
      fetchArticleHtml("https://nope.example/", {
        resolve: resolver({}),
        transport: jest.fn(),
      }),
    ).rejects.toBeInstanceOf(ArticleFetchError);
  });
});

describe("nodeTransport", () => {
  let server: http.Server;
  let port: number;
  let lastHeaders: http.IncomingHttpHeaders;

  beforeAll(async () => {
    server = http.createServer((request, response) => {
      lastHeaders = request.headers;
      // Never answers, so a test can abort the request.
      if (request.url === "/hang") return;
      response.writeHead(200, { "content-type": "text/html" });
      response.end("<p>hello</p>");
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  it("connects to the address it was given, not to what the host name resolves to", async () => {
    // `.invalid` never resolves, so this only works if the lookup is pinned.
    const url = new URL(`http://pinned.invalid:${port}/page`);

    const response = await nodeTransport({
      url,
      address: "127.0.0.1",
      family: 4,
      signal: AbortSignal.timeout(2000),
    });
    const body = Buffer.concat(
      await Array.fromAsync(response.body, (chunk) => Buffer.from(chunk)),
    ).toString();

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("text/html");
    expect(body).toBe("<p>hello</p>");
    expect(lastHeaders.host).toBe(`pinned.invalid:${port}`);
    expect(lastHeaders["accept-encoding"]).toBe("identity");
  });

  it("rejects when the signal aborts before the server answers", async () => {
    const url = new URL(`http://pinned.invalid:${port}/hang`);

    await expect(
      nodeTransport({
        url,
        address: "127.0.0.1",
        family: 4,
        signal: AbortSignal.timeout(50),
      }),
    ).rejects.toBeDefined();
  });
});

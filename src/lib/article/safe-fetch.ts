import "server-only";

import { lookup as dnsLookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";

export const MAX_ARTICLE_BYTES = 1_048_576;
export const MAX_REDIRECTS = 3;
export const FETCH_TIMEOUT_MS = 8000;

const USER_AGENT = "TechNewsReader/1.0 (article summaries)";

export type ArticleFetchErrorKind =
  | "blocked"
  | "unsupported"
  | "too-large"
  | "too-many-redirects"
  | "timeout"
  | "failed";

/** The page couldn't be fetched safely; `kind` says why. */
export class ArticleFetchError extends Error {
  kind: ArticleFetchErrorKind;

  constructor(kind: ArticleFetchErrorKind, message: string) {
    super(message);
    this.name = "ArticleFetchError";
    this.kind = kind;
  }
}

type ResolvedAddress = { address: string; family: 4 | 6 };

export type TransportRequest = ResolvedAddress & {
  url: URL;
  signal: AbortSignal;
};

export type TransportResponse = {
  status: number;
  /** Header names in lower case. */
  headers: Record<string, string | undefined>;
  body: AsyncIterable<Uint8Array>;
  /** Drops the connection without reading the rest of the body. */
  close?: () => void;
};

export type Transport = (
  request: TransportRequest,
) => Promise<TransportResponse>;

export type FetchDeps = {
  resolve: (hostname: string) => Promise<ResolvedAddress[]>;
  transport: Transport;
  timeoutMs: number;
};

// Ranges a public web page never lives in: this server's own network, cloud
// metadata (169.254.169.254) and special-use blocks. Two lists, because
// `BlockList` matches an IPv4 address against IPv6 rules as if it were
// IPv4-mapped, so the `::ffff:0:0/96` rule below would block every IPv4.
const NON_PUBLIC_V4 = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  NON_PUBLIC_V4.addSubnet(network, prefix, "ipv4");
}
const NON_PUBLIC_V6 = new BlockList();
for (const [network, prefix] of [
  // The unspecified and loopback addresses, and the deprecated IPv4-compatible block.
  ["::", 96],
  // IPv4-mapped, NAT64, 6to4 and Teredo addresses can hide an IPv4 target from
  // the rules above.
  ["::ffff:0:0", 96],
  ["64:ff9b::", 96],
  ["2002::", 16],
  ["2001::", 32],
  ["2001:db8::", 32],
  ["100::", 64],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const) {
  NON_PUBLIC_V6.addSubnet(network, prefix, "ipv6");
}

/** Whether `address` is a routable address on the public internet. */
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return false;
  try {
    return family === 4
      ? !NON_PUBLIC_V4.check(address, "ipv4")
      : !NON_PUBLIC_V6.check(address, "ipv6");
  } catch {
    return false;
  }
}

async function resolveHost(hostname: string): Promise<ResolvedAddress[]> {
  const addresses = await dnsLookup(hostname, { all: true, verbatim: true });
  return addresses.map(({ address, family }) => ({
    address,
    family: family === 6 ? 6 : 4,
  }));
}

/** Rejects when `signal` aborts, so a slow DNS answer can't outlive the deadline. */
function untilAborted<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    promise
      .finally(() => signal.removeEventListener("abort", onAbort))
      .then(resolve, reject);
  });
}

export const nodeTransport: Transport = ({ url, address, family, signal }) =>
  new Promise((resolve, reject) => {
    // Connect to the address that passed the check, not to a second DNS answer
    // (DNS rebinding). The host name still drives the Host header and TLS.
    const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
      if (options.all) callback(null, [{ address, family }]);
      else callback(null, address, family);
    };
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(
      url,
      {
        method: "GET",
        signal,
        lookup: pinnedLookup,
        // Identity keeps the size cap on the bytes we read, not on a
        // decompressed bomb.
        headers: {
          accept: "text/html,application/xhtml+xml",
          "accept-encoding": "identity",
          "user-agent": USER_AGENT,
        },
      },
      (response) => {
        const headers: Record<string, string | undefined> = {};
        for (const [name, value] of Object.entries(response.headers)) {
          headers[name] = Array.isArray(value) ? value.join(", ") : value;
        }
        resolve({
          status: response.statusCode ?? 0,
          headers,
          body: response,
          close: () => response.destroy(),
        });
      },
    );
    request.on("error", reject);
    request.end();
  });

function parseWebUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ArticleFetchError("blocked", "not a valid URL");
  }
  const isWeb = url.protocol === "http:" || url.protocol === "https:";
  if (!isWeb || !url.hostname || url.username || url.password) {
    throw new ArticleFetchError(
      "blocked",
      `${url.protocol} URLs aren't allowed`,
    );
  }
  return url;
}

/** The address to connect to, once every address the host has is public. */
async function pickPublicAddress(
  url: URL,
  resolve: FetchDeps["resolve"],
  signal: AbortSignal,
): Promise<ResolvedAddress> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const literalFamily = isIP(hostname);
  const addresses: ResolvedAddress[] = literalFamily
    ? [{ address: hostname, family: literalFamily === 6 ? 6 : 4 }]
    : await untilAborted(resolve(hostname), signal);

  if (
    addresses.length === 0 ||
    !addresses.every(({ address }) => isPublicAddress(address))
  ) {
    throw new ArticleFetchError(
      "blocked",
      `${hostname} isn't a public address`,
    );
  }
  return addresses[0];
}

function decode(bytes: Buffer, contentType: string): string {
  const charset = /charset=["']?([\w-]+)/i.exec(contentType)?.[1] ?? "utf-8";
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function readHtml(response: TransportResponse): Promise<string> {
  const { status, headers } = response;
  if (status < 200 || status >= 300) {
    throw new ArticleFetchError("failed", `the server answered ${status}`);
  }
  const contentType = headers["content-type"] ?? "";
  if (!/^(text\/html|application\/xhtml\+xml)\b/i.test(contentType)) {
    throw new ArticleFetchError("unsupported", "the page isn't HTML");
  }
  const encoding = headers["content-encoding"];
  if (encoding && encoding.toLowerCase() !== "identity") {
    throw new ArticleFetchError("unsupported", "the page is compressed");
  }
  if (Number(headers["content-length"]) > MAX_ARTICLE_BYTES) {
    throw new ArticleFetchError("too-large", "the page is too large");
  }

  const parts: Buffer[] = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > MAX_ARTICLE_BYTES) {
      throw new ArticleFetchError("too-large", "the page is too large");
    }
    parts.push(Buffer.from(chunk));
  }
  return decode(Buffer.concat(parts), contentType);
}

/**
 * Downloads a story's page for summarizing. The URL comes from an HN
 * submitter, so every hop is checked: web schemes only, every resolved
 * address public, a few redirects at most, and a time and size limit.
 */
export async function fetchArticleHtml(
  rawUrl: string,
  deps: Partial<FetchDeps> = {},
): Promise<string> {
  const {
    resolve = resolveHost,
    transport = nodeTransport,
    timeoutMs = FETCH_TIMEOUT_MS,
  } = deps;
  // One deadline for the whole fetch, redirects and body included.
  const signal = AbortSignal.timeout(timeoutMs);

  try {
    let url = parseWebUrl(rawUrl);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const target = await pickPublicAddress(url, resolve, signal);
      const response = await transport({ url, ...target, signal });
      try {
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.location;
          if (!location) {
            throw new ArticleFetchError("failed", "a redirect had no target");
          }
          url = parseWebUrl(new URL(location, url).href);
          continue;
        }
        return await readHtml(response);
      } finally {
        response.close?.();
      }
    }
    throw new ArticleFetchError("too-many-redirects", "too many redirects");
  } catch (cause) {
    if (cause instanceof ArticleFetchError) throw cause;
    if (signal.aborted) {
      throw new ArticleFetchError("timeout", "the page took too long to load");
    }
    throw new ArticleFetchError(
      "failed",
      `couldn't fetch the page (${String(cause)})`,
    );
  }
}

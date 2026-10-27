import {
  getBookmarks,
  NO_BOOKMARKS,
  subscribeToBookmarks,
  toggleBookmark,
} from "@/lib/bookmarks";
import type { Story } from "@/lib/hn/types";

const STORAGE_KEY = "tech-news:bookmarks";

function makeStory(id: number): Story {
  return {
    id,
    title: `Story ${id}`,
    url: `https://example.com/${id}`,
    domain: "example.com",
    author: "pg",
    score: 10,
    commentsCount: 3,
    publishedAt: new Date("2026-01-15T09:00:00Z"),
    commentsUrl: `https://news.ycombinator.com/item?id=${id}`,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getBookmarks", () => {
  it("is empty before anything is saved", () => {
    expect(getBookmarks()).toEqual([]);
  });

  it("returns the same list until a bookmark changes", () => {
    toggleBookmark(makeStory(1));

    expect(getBookmarks()).toBe(getBookmarks());
    expect(getBookmarks()).not.toBe(NO_BOOKMARKS);
  });

  it.each([
    ["text that isn't JSON", "{not json"],
    ["JSON that isn't a list", '{"id":1}'],
  ])("reads %s as an empty list", (_label, stored) => {
    window.localStorage.setItem(STORAGE_KEY, stored);

    expect(getBookmarks()).toBe(NO_BOOKMARKS);
  });

  it("skips stored entries that aren't stories", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        null,
        7,
        { id: "x", publishedAt: "2026-01-15T09:00:00.000Z" },
        { id: 2, publishedAt: "not a date" },
        { id: 4, publishedAt: "2026-01-15T09:00:00.000Z" },
        { ...makeStory(5), title: 5, publishedAt: "2026-01-15T09:00:00.000Z" },
        { ...makeStory(3), publishedAt: "2026-01-15T09:00:00.000Z" },
      ]),
    );

    expect(getBookmarks().map((story) => story.id)).toEqual([3]);
  });

  it("is empty when storage can't be read", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    expect(getBookmarks()).toEqual([]);
  });
});

describe("toggleBookmark", () => {
  it("saves a story and gives its date back as a Date", () => {
    const story = makeStory(1);

    toggleBookmark(story);

    expect(getBookmarks()).toEqual([story]);
    expect(getBookmarks()[0].publishedAt).toBeInstanceOf(Date);
  });

  it("removes a story that is already saved", () => {
    toggleBookmark(makeStory(1));
    toggleBookmark(makeStory(2));

    toggleBookmark(makeStory(1));

    expect(getBookmarks().map((story) => story.id)).toEqual([2]);
  });

  it("lists the newest save first", () => {
    toggleBookmark(makeStory(1));
    toggleBookmark(makeStory(2));

    expect(getBookmarks().map((story) => story.id)).toEqual([2, 1]);
  });

  it("keeps what it saved across a reload", () => {
    toggleBookmark(makeStory(1));

    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"),
    ).toEqual([{ ...makeStory(1), publishedAt: "2026-01-15T09:00:00.000Z" }]);
  });

  it("does nothing, without throwing, when storage can't be written", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const listener = jest.fn();
    const unsubscribe = subscribeToBookmarks(listener);

    expect(() => toggleBookmark(makeStory(1))).not.toThrow();

    expect(getBookmarks()).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});

describe("subscribeToBookmarks", () => {
  it("calls the listener when a bookmark changes, until unsubscribed", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToBookmarks(listener);

    toggleBookmark(makeStory(1));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    toggleBookmark(makeStory(2));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("calls the listener when another tab changes storage", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToBookmarks(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

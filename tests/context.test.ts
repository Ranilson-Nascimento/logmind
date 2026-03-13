import { describe, it, expect, beforeEach } from "vitest";
import { withContext, withContextAsync, getContext, setContext, clearContext } from "../src/context.js";

describe("context", () => {
  beforeEach(() => {
    clearContext();
  });

  it("getContext returns empty when no context set", () => {
    expect(getContext()).toEqual({});
  });

  it("withContext merges context inside block", () => {
    let inner: ReturnType<typeof getContext> = {};
    withContext({ userId: "u1", requestId: "r1" }, () => {
      inner = getContext();
    });
    expect(inner).toEqual({ userId: "u1", requestId: "r1" });
  });

  it("getContext returns empty after withContext exits", () => {
    withContext({ userId: "u1" }, () => {});
    expect(getContext()).toEqual({});
  });

  it("nested withContext merges context", () => {
    let inner: ReturnType<typeof getContext> = {};
    withContext({ userId: "u1" }, () => {
      withContext({ requestId: "r1" }, () => {
        inner = getContext();
      });
    });
    expect(inner).toEqual({ userId: "u1", requestId: "r1" });
  });

  it("inner context overrides outer keys", () => {
    let inner: ReturnType<typeof getContext> = {};
    withContext({ userId: "u1", foo: "outer" }, () => {
      withContext({ foo: "inner" }, () => {
        inner = getContext();
      });
    });
    expect(inner).toEqual({ userId: "u1", foo: "inner" });
  });

  it("withContext returns fn result", () => {
    const out = withContext({ x: 1 }, () => 42);
    expect(out).toBe(42);
  });

  it("setContext and getContext round-trip", () => {
    setContext({ a: "b" });
    expect(getContext()).toEqual({ a: "b" });
    clearContext();
    expect(getContext()).toEqual({});
  });

  it("withContextAsync merges context inside async fn", async () => {
    let inner: ReturnType<typeof getContext> = {};
    await withContextAsync({ userId: "u1", requestId: "r1" }, async () => {
      inner = getContext();
    });
    expect(inner).toEqual({ userId: "u1", requestId: "r1" });
  });

  it("withContextAsync returns fn result", async () => {
    const out = await withContextAsync({ x: 1 }, async () => 43);
    expect(out).toBe(43);
  });

  it("withContextAsync propagates context after await", async () => {
    let afterAwait: ReturnType<typeof getContext> = {};
    await withContextAsync({ requestId: "req-1" }, async () => {
      await Promise.resolve();
      afterAwait = getContext();
    });
    expect(afterAwait).toEqual({ requestId: "req-1" });
  });
});

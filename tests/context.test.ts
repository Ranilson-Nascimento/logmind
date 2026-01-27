import { describe, it, expect, beforeEach } from "vitest";
import { withContext, getContext, setContext, clearContext } from "../src/context.js";

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
});

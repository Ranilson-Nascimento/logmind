import { describe, it, expect, beforeEach } from "vitest";
import { initLogger, log, applyRedact, withContext } from "../src/index.js";
import type { LogEntry } from "../src/types.js";

describe("redact", () => {
  let captured: LogEntry[];

  beforeEach(() => {
    captured = [];
    initLogger({
      app: "test",
      version: "1.0.0",
      transport: { send: (e) => captured.push(e) },
      redact: {
        keys: ["password", "token"],
        replacement: "[REDACTED]",
      },
    });
  });

  it("redacts keys from meta", () => {
    log.info("Login", { userId: "u1", password: "secret123", token: "abc" });
    expect(captured[0].meta).toEqual({
      userId: "u1",
      password: "[REDACTED]",
      token: "[REDACTED]",
    });
  });

  it("redacts keys from context when set via withContext", () => {
    withContext({ requestId: "r1", token: "xyz" }, () => {
      log.info("With token in context");
    });
    expect(captured[0].context).toHaveProperty("requestId", "r1");
    expect(captured[0].context).toHaveProperty("token", "[REDACTED]");
  });
});

describe("applyRedact", () => {
  it("returns entry unchanged when no keys or patterns", () => {
    const entry: LogEntry = {
      level: "info",
      message: "x",
      timestamp: new Date().toISOString(),
      env: "test",
      meta: { password: "secret" },
    };
    const out = applyRedact(entry, { keys: [] });
    expect(out.meta).toEqual(entry.meta);
  });

  it("redacts nested object keys", () => {
    const entry: LogEntry = {
      level: "info",
      message: "x",
      timestamp: new Date().toISOString(),
      env: "test",
      meta: { user: { name: "a", password: "p" } },
    };
    const out = applyRedact(entry, { keys: ["password"] });
    expect((out.meta as { user: { name: string; password: string } }).user.password).toBe("[REDACTED]");
  });
});

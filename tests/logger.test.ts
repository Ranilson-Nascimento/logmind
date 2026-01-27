import { describe, it, expect, beforeEach } from "vitest";
import { initLogger, log, withContext } from "../src/index.js";
import type { LogEntry, Transport } from "../src/types.js";

describe("logger", () => {
  let captured: LogEntry[];

  beforeEach(() => {
    captured = [];
    const transport: Transport = {
      send(entry) {
        captured.push(entry);
        return;
      },
    };
    initLogger({
      app: "test-app",
      version: "1.0.0",
      env: "test",
      transport,
    });
  });

  it("log.info sends entry with level, message, app, version, env", () => {
    log.info("Hello");
    expect(captured.length).toBe(1);
    expect(captured[0].level).toBe("info");
    expect(captured[0].message).toBe("Hello");
    expect(captured[0].app).toBe("test-app");
    expect(captured[0].version).toBe("1.0.0");
    expect(captured[0].env).toBe("test");
    expect(captured[0].timestamp).toBeDefined();
  });

  it("log.warn and log.error send correct level", () => {
    log.warn("w");
    log.error("e");
    expect(captured.length).toBe(2);
    expect(captured[0].level).toBe("warn");
    expect(captured[1].level).toBe("error");
  });

  it("log.info with meta includes meta", () => {
    log.info("x", { orderId: "o1" });
    expect(captured[0].meta).toEqual({ orderId: "o1" });
  });

  it("log.error with Error includes error and diagnosis", () => {
    const err = new Error("db fail");
    (err as { code?: string }).code = "ECONNREFUSED";
    log.error("DB error", err);
    expect(captured[0].error).toBeDefined();
    expect(captured[0].error!.name).toBe("Error");
    expect(captured[0].error!.message).toBe("db fail");
    expect(captured[0].error!.diagnosis).toBeDefined();
    expect(captured[0].error!.diagnosis!.category).toBe("database");
  });

  it("log.auto uses error message when no message provided", () => {
    log.auto(new Error("auto err"));
    expect(captured[0].message).toBe("auto err");
    expect(captured[0].level).toBe("error");
  });

  it("logs inside withContext include context", () => {
    withContext({ userId: "u1", requestId: "r1" }, () => {
      log.info("Inside");
    });
    expect(captured[0].context).toEqual({ userId: "u1", requestId: "r1" });
  });

  it("log.debug sends when not in production", () => {
    initLogger({
      app: "t",
      version: "1",
      env: "development",
      production: false,
      transport: { send(e) { captured.push(e); } },
    });
    log.debug("dbg");
    expect(captured.length).toBe(1);
    expect(captured[0].level).toBe("debug");
  });
});

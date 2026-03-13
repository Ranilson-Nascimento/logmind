import { describe, it, expect, beforeEach } from "vitest";
import { initLogger, createChildLogger, withContext } from "../src/index.js";

describe("createChildLogger", () => {
  let captured: { message: string; context?: Record<string, string> }[];

  beforeEach(() => {
    captured = [];
    initLogger({
      app: "test",
      version: "1.0.0",
      transport: {
        send(entry) {
          captured.push({ message: entry.message, context: entry.context });
        },
      },
    });
  });

  it("adds extra context to every log", () => {
    const child = createChildLogger({ component: "billing", service: "payments" });
    child.info("Charge created");
    expect(captured).toHaveLength(1);
    expect(captured[0].context).toMatchObject({ component: "billing", service: "payments" });
    expect(captured[0].message).toBe("Charge created");
  });

  it("merges with existing context when inside withContext", () => {
    const child = createChildLogger({ component: "api" });
    withContext({ requestId: "req-1" }, () => {
      child.info("Handled");
    });
    expect(captured[0].context).toMatchObject({ requestId: "req-1", component: "api" });
  });
});

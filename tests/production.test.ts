import { describe, it, expect, beforeEach } from "vitest";
import { productionFilter, resetProductionState } from "../src/production.js";
import type { LogEntry } from "../src/types.js";

function entry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    level: "info",
    message: "test",
    timestamp: new Date().toISOString(),
    env: "test",
    ...overrides,
  };
}

describe("productionFilter", () => {
  beforeEach(() => {
    resetProductionState();
  });

  it("drops debug when minLevel is info", () => {
    const e = entry({ level: "debug" });
    expect(productionFilter(e, "info")).toBeNull();
  });

  it("keeps info when minLevel is info", () => {
    const e = entry({ level: "info" });
    expect(productionFilter(e, "info")).toEqual(e);
  });

  it("keeps warn and error", () => {
    expect(productionFilter(entry({ level: "warn" }), "info")).not.toBeNull();
    expect(productionFilter(entry({ level: "error" }), "info")).not.toBeNull();
  });

  it("keeps first few repeated errors, then emits [repeated Nx]", () => {
    const base: LogEntry = entry({
      level: "error",
      message: "Oops",
      error: { name: "Error", message: "Oops", code: "X" },
    });

    for (let i = 0; i < 5; i++) {
      const out = productionFilter(base, "info");
      expect(out).not.toBeNull();
      expect(out!.message).toBe("Oops");
    }
    const sixth = productionFilter(base, "info");
    expect(sixth).not.toBeNull();
    expect(sixth!.message).toMatch(/\[repeated \d+x\] Oops/);
  });

  it("suppresses further repeats after [repeated Nx]", () => {
    const base: LogEntry = entry({
      level: "error",
      message: "Fail",
      error: { name: "Error", message: "Fail", code: "Y" },
    });
    let repeated: LogEntry | null = null;
    for (let i = 0; i < 6; i++) {
      const out = productionFilter(base, "info");
      if (out && /\[repeated/.test(out.message)) repeated = out;
    }
    expect(repeated).not.toBeNull();
    expect(repeated!.message).toMatch(/\[repeated \d+x\] Fail/);
    const next = productionFilter(base, "info");
    expect(next).toBeNull();
  });
});

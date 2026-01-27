import { describe, it, expect } from "vitest";
import { createTransport } from "../src/transports/index.js";
import type { LogEntry } from "../src/types.js";

describe("createTransport", () => {
  it('createTransport("json") returns a transport', () => {
    const t = createTransport("json");
    expect(t).toBeDefined();
    expect(typeof t.send).toBe("function");
  });

  it("json transport send emits valid JSON line", () => {
    const chunks: string[] = [];
    const stream = {
      write(chunk: string) {
        chunks.push(chunk);
      },
    };
    const t = createTransport("json", { stream: stream as NodeJS.WritableStream });
    const entry: LogEntry = {
      level: "info",
      message: "hello",
      timestamp: "2025-01-01T00:00:00.000Z",
      env: "test",
    };
    t.send(entry);
    expect(chunks.length).toBe(1);
    const parsed = JSON.parse(chunks[0].trim());
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("hello");
    expect(parsed.timestamp).toBe(entry.timestamp);
    expect(parsed.env).toBe("test");
  });
});

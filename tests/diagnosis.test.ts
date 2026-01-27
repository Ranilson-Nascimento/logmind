import { describe, it, expect } from "vitest";
import { diagnose } from "../src/diagnosis/index.js";

describe("diagnose", () => {
  it("classifies ECONNREFUSED as database", () => {
    const err = new Error("connect ECONNREFUSED 127.0.0.1:27017");
    (err as { code?: string }).code = "ECONNREFUSED";
    const r = diagnose(err);
    expect(r.category).toBe("database");
    expect(r.code).toBe("ECONNREFUSED");
    expect(r.hint).toBeDefined();
    expect(r.suggestedAction).toBeDefined();
  });

  it("classifies ECONNRESET as network", () => {
    const err = new Error("socket hang up");
    (err as { code?: string }).code = "ECONNRESET";
    const r = diagnose(err);
    expect(r.category).toBe("network");
    expect(r.code).toBe("ECONNRESET");
  });

  it("classifies EACCES as permission", () => {
    const err = new Error("EACCES: permission denied");
    (err as { code?: string }).code = "EACCES";
    const r = diagnose(err);
    expect(r.category).toBe("permission");
  });

  it("classifies validation-style message as validation", () => {
    const r = diagnose(new Error("Validation failed: email is required"));
    expect(r.category).toBe("validation");
  });

  it("classifies timeout message as timeout", () => {
    const r = diagnose(new Error("timeout of 5000ms exceeded"));
    expect(r.category).toBe("timeout");
  });

  it("classifies ENOENT as known", () => {
    const err = new Error("ENOENT: no such file");
    (err as { code?: string }).code = "ENOENT";
    const r = diagnose(err);
    expect(r.category).toBe("known");
  });

  it("returns unknown for unclassified errors", () => {
    const r = diagnose(new Error("Something obscure happened"));
    expect(r.category).toBe("unknown");
  });

  it("handles non-Error throwables", () => {
    const r = diagnose("plain string");
    expect(r.category).toBe("unknown");
  });
});

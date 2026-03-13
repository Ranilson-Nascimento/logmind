#!/usr/bin/env node
"use strict";

const [, , cmd] = process.argv;

function doctor() {
  console.log("Logmind doctor");
  console.log("Node:", process.version);
  const nodeMajor = parseInt(process.version.slice(1).split(".")[0], 10);
  if (nodeMajor < 16) {
    console.log("Warning: Node 16+ recommended. Current:", process.version);
  }
  try {
    const logmind = require("../dist/index.js");
    logmind.initLogger({ app: "logmind-doctor", version: "1.0.0" });
    logmind.log.info("Doctor: logmind loaded OK");
    console.log("Logmind: loaded OK");
    const err = new Error("connect ECONNREFUSED");
err.code = "ECONNREFUSED";
const r = logmind.diagnose(err);
    console.log("Diagnosis sample:", r.category, r.severity || "");
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

if (cmd === "doctor") {
  doctor();
} else {
  console.log("Usage: logmind doctor");
  console.log("  doctor  Check environment and logmind load");
}

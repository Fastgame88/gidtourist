import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node:child_process";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

test("backend exposes a healthy Railway endpoint", async () => {
  const port = 43117;
  const child = spawn(process.execPath, ["dist/main.js"], {
    env: {
      ...process.env,
      PORT: String(port),
      ALLOWED_ORIGINS: "http://localhost:3000",
    },
    stdio: "ignore",
  });

  try {
    let response;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        response = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
        if (response.ok) break;
      } catch {
        await wait(100);
      }
    }

    assert.ok(response?.ok, "health endpoint did not become ready");
    const payload = await response.json();
    assert.equal(payload.status, "ok");
    assert.equal(payload.stage, 1);
  } finally {
    child.kill("SIGTERM");
  }
});

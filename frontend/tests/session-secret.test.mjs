import assert from "node:assert/strict";
import test from "node:test";
import { createCookieSessionStorage } from "react-router";

import { getSessionSecret } from "../app/libs/session-secret.ts";

test("empty session secret reproduces the cookie signing failure", async () => {
  const storage = createCookieSessionStorage({
    cookie: { name: "test-session", secrets: [""] },
  });
  const session = await storage.getSession();

  await assert.rejects(
    storage.commitSession(session),
    /Zero-length key is not supported/,
  );
});

test("missing and blank session secrets fail with configuration guidance", () => {
  for (const value of [undefined, "", "   "]) {
    assert.throws(
      () => getSessionSecret(value),
      /SESSION_SECRET must be set to a non-empty value/,
    );
  }
});

test("configured session secrets are trimmed and returned", () => {
  assert.equal(getSessionSecret("  unit-test-key  "), "unit-test-key");
});

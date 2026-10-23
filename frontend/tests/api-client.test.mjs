import assert from "node:assert/strict";
import test from "node:test";

process.env.REACT_PUBLIC_API_ENDPOINT = "http://127.0.0.1:8000/api";

const { createApiClient } = await import("../app/libs/api/index.ts");
const { getApiErrorMessages } = await import("../app/libs/api/errors.ts");
const { buildPaginationHref } = await import("../app/libs/pagination.ts");

test("API clients isolate authorization tokens between concurrent requests", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];

  globalThis.fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    requests.push({
      url: request.url,
      authorization: request.headers.get("Authorization"),
    });
    return new Response(JSON.stringify({ articles: [], articlesCount: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    await Promise.all([
      createApiClient("user-a-token").GET("/articles"),
      createApiClient("user-b-token").GET("/articles"),
      createApiClient().GET("/articles"),
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(requests, [
    {
      url: "http://127.0.0.1:8000/api/articles",
      authorization: "Token user-a-token",
    },
    {
      url: "http://127.0.0.1:8000/api/articles",
      authorization: "Token user-b-token",
    },
    {
      url: "http://127.0.0.1:8000/api/articles",
      authorization: null,
    },
  ]);
});

test("backend field errors are displayed with their message", () => {
  assert.deepEqual(
    getApiErrorMessages({
      message: "Incorrect email or password.",
      errors: {
        email: ["incorrect email or password."],
        password: ["incorrect email or password."],
      },
    }),
    ["Incorrect email or password.", "incorrect email or password."],
  );
});

test("pagination updates page and retains existing query filters", () => {
  assert.equal(
    buildPaginationHref("/", "?tag=dev%20sec&size=5&page=1", 3),
    "/?tag=dev+sec&size=5&page=3",
  );
});

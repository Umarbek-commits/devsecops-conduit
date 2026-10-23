import createFetchClient from "openapi-fetch";
import type { Middleware } from "openapi-fetch";
import type { paths } from "~/consts/schema";

const configuredEndpoint = process.env.REACT_PUBLIC_API_ENDPOINT;

function withApiPrefix(endpoint: string | undefined): string {
  if (!endpoint?.trim()) {
    throw new Error("REACT_PUBLIC_API_ENDPOINT must be configured");
  }

  const url = new URL(endpoint.trim());
  const path = url.pathname.replace(/\/+$/, "");
  url.pathname = path === "/api" || path.endsWith("/api") ? path : `${path}/api`;
  return url.toString().replace(/\/$/, "");
}

const baseUrl = withApiPrefix(configuredEndpoint);

export const createApiClient = (token?: string) => {
  const client = createFetchClient<paths>({ baseUrl });
  const middleware: Middleware = {
    onRequest({ request }) {
      if (token) request.headers.set("Authorization", `Token ${token}`);
      return request;
    },
    onError({ error }) {
      return new Error("Oops, fetch failed", { cause: error });
    },
  };
  client.use(middleware);
  return client;
};

// This default client is intentionally anonymous. Authenticated route handlers
// obtain their own client from the request's React Router context.
const fetchClient = createApiClient();

export default fetchClient;

import { createContext } from "react-router";
import type { createApiClient } from "~/libs/api";

export const apiClientContext = createContext<ReturnType<typeof createApiClient>>(
  null!,
);

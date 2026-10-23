import { createCookieSessionStorage, type ActionFunctionArgs } from "react-router";
import { COOKIE_KEY } from "./consts";
import { createApiClient } from "./libs/api";
import { getSessionSecret } from "./libs/session-secret";

type SessionData = {
  token: string;
};

type SessionFlashData = {
  error: string;
};

const configuredSecret = process.env.SESSION_SECRET?.trim();
const sessionStorage = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  // Build prerender can import routes without runtime secrets. Requests that
  // read a signed cookie and all operations that write cookies validate first.
  cookie: {
    name: COOKIE_KEY,
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    path: "/",
    sameSite: "lax",
    secrets: configuredSecret ? [configuredSecret] : [],
    secure: process.env.NODE_ENV !== "development",
  },
});

function hasSessionCookie(cookieHeader: string | null | undefined): boolean {
  return Boolean(
    cookieHeader
      ?.split(";")
      .some((cookie) => cookie.trim().startsWith(`${COOKIE_KEY}=`)),
  );
}

export function getSession(
  ...args: Parameters<typeof sessionStorage.getSession>
) {
  if (hasSessionCookie(args[0])) {
    getSessionSecret(process.env.SESSION_SECRET);
  }
  return sessionStorage.getSession(...args);
}

export function commitSession(
  ...args: Parameters<typeof sessionStorage.commitSession>
) {
  getSessionSecret(process.env.SESSION_SECRET);
  return sessionStorage.commitSession(...args);
}

export function destroySession(
  ...args: Parameters<typeof sessionStorage.destroySession>
) {
  getSessionSecret(process.env.SESSION_SECRET);
  return sessionStorage.destroySession(...args);
}




export const checkIsLogin = async (request: ActionFunctionArgs['request']) => {
  const session = await getSession(request.headers.get("Cookie"));

  return session.has('token')
}


export const getSessionToken = async (request: ActionFunctionArgs['request']) => {
  const session = await getSession(request.headers.get("Cookie"));

  return session.get('token')
}


export const getUser = async(request: ActionFunctionArgs['request']) => {
  const user = await createApiClient(await getSessionToken(request)).GET("/user");

  return user
}

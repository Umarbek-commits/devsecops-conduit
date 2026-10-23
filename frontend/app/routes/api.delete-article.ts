import { redirect, type ActionFunctionArgs } from "react-router";
import { authMiddleware } from "~/middlewares/auth";
import { checkIsLogin } from "~/session.server";
import type { Route } from "../+types/root";
import { apiClientContext } from "~/context/apiClient";
import { getApiErrorMessages } from "~/libs/api/errors";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function action({ request, context }: ActionFunctionArgs) {
  if (!(await checkIsLogin(request))) {
    return redirect("/login");
  }
  let data = await request.json();
  const { slug } = data as {
    slug: string;
  };

  const params = {
    params: {
      path: {
        slug,
      },
    },
  };

  try {
    const result = await context.get(apiClientContext).DELETE("/articles/{slug}", params);
    if (result.error) return { errors: getApiErrorMessages(result.error) };

    return redirect("/");
  } catch (error) {
    return { errors: getApiErrorMessages(error) };
  }
}

export { loader } from "~/libs/actions";
export { ErrorBoundary } from "~/root";

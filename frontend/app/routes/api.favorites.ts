import { redirect, type ActionFunctionArgs } from "react-router";
import { checkIsLogin } from "~/session.server";
import { apiClientContext } from "~/context/apiClient";
import { getApiErrorMessages } from "~/libs/api/errors";


export async function action({ request, context }: ActionFunctionArgs) {
  if (!await checkIsLogin(request)) {
    return redirect("/login");
  }
  let formData = await request.formData();
  const data = Object.fromEntries(formData);
  const { action, slug } = data as {
    slug: string;
    action: "favorite" | "unfavorite";
  };

  const params = {
    params: {
      path: {
        slug,
      },
    },
  };

  try {
    const result = await (action === "favorite"
      ? context.get(apiClientContext).POST("/articles/{slug}/favorite", params)
      : context.get(apiClientContext).DELETE("/articles/{slug}/favorite", params));

    if (result.error) return { errors: getApiErrorMessages(result.error) };

    return { errors: [] };
  } catch (error) {
    return { errors: getApiErrorMessages(error) };
  }
}

export { loader } from "~/libs/actions"
export { ErrorBoundary } from "~/root";

import { redirect, type ActionFunctionArgs } from "react-router";
import { checkIsLogin } from "~/session.server";
import { apiClientContext } from "~/context/apiClient";
import { getApiErrorMessages } from "~/libs/api/errors";

export async function action({ request, context }: ActionFunctionArgs) {
  if (!(await checkIsLogin(request))) {
    return redirect("/login");
  }
  let data = await request.json();
  const { slug, id } = data as {
    slug: string;
    id: number
  };

  const params = {
    params: {
      path: {
        slug,
        id
      },
    },
  };

  try {
    const result = await context.get(apiClientContext).DELETE("/articles/{slug}/comments/{id}", params);

    if (result.error) return { errors: getApiErrorMessages(result.error) };

    return { errors: [] };
  } catch (error) {
    return { errors: getApiErrorMessages(error) };
  }
}

export { loader } from "~/libs/actions";
export { ErrorBoundary } from "~/root";

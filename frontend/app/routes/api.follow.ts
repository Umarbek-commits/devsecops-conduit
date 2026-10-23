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
  const { action, username } = data as {
    username: string;
    action: "follow" | "unfollow";
  };

  const params = {
    params: {
      path: {
        username,
      },
    },
  };

  try {
    const result = await (action === "follow"
      ? context.get(apiClientContext).POST("/profiles/{username}/follow", params)
      : context.get(apiClientContext).DELETE("/profiles/{username}/follow", params));

    if (result.error) return { errors: getApiErrorMessages(result.error) };

    return { errors: [], success: action };
  } catch (error) {
    return { errors: getApiErrorMessages(error) };
  }
}

export { loader } from "~/libs/actions"
export { ErrorBoundary } from "~/root";

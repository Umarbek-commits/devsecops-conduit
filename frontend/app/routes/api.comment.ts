import { redirect, type ActionFunctionArgs } from "react-router";
import { inputsSchema } from "~/libs/schemas/comment";
import { checkIsLogin } from "~/session.server";
import { apiClientContext } from "~/context/apiClient";
import { getApiErrorMessages } from "~/libs/api/errors";

export async function action({ request, context }: ActionFunctionArgs) {
  if (!(await checkIsLogin(request))) {
    return redirect("/login");
  }
  let data = await request.json();
  const { slug, ...updateData } = data as {
    slug: string;
    body: string;
  };
  const result = inputsSchema.safeParse(updateData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      formState: updateData,
      errors: undefined,
    };
  }

  try {
    const res = await context.get(apiClientContext).POST("/articles/{slug}/comments", {
      params: {
        path: {
          slug,
        },
      },
      body: {
        comment: result.data,
      },
    });

    if (res.error) {
      return {
        errors: getApiErrorMessages(res.error),
        formState: updateData,
      };
    }

    return {
      errors: [],
      formState: null,
      fieldErrors: []
    };
  } catch (error) {
    return {
      errors: getApiErrorMessages(error),
      formState: updateData,
    };
  }
}

export { loader } from "~/libs/actions";
export { ErrorBoundary } from "~/root";

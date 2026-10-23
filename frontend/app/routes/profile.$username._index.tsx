import { useLoaderData } from "react-router";
import type { Route } from "./+types/profile.$username._index";
import { apiClientContext } from "~/context/apiClient";
import Articles from "~/components/Articles";
import { throwApiError } from "~/libs/api/errors";

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const username = params.username;
  const url = new URL(request.url);

  const searchParams = Object.fromEntries(url.searchParams.entries()) as {
    page: string;
    size: string;
  };

  const page = searchParams?.page || 1;
  const size = searchParams?.size || 10;

  const res = await context.get(apiClientContext).GET("/articles", {
    params: {
      query: {
        limit: Number(size),
        offset: Number(size) * (Number(page) - 1),
        author: username,
      },
    },
  });
  if (res.error) throwApiError(res.error);
  return {
    ...res.data,
    page: Number(page),
    size: Number(size),
  };
}

export default () => {
  const {
    page,
    size,
    articlesCount: total = 0,
    articles = [],
  } = useLoaderData<typeof loader>();

  return <Articles total={total} articles={articles} page={page} size={size} />;
};

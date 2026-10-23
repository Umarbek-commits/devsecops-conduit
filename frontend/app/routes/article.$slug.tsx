import dayjs from "dayjs";
import { remark } from "remark";
import html from "remark-html";

import { apiClientContext } from "~/context/apiClient";
import type { Route } from "./+types/article.$slug";
import { useLoaderData } from "react-router";
import ArticleMeta from "~/components/ArticleDetail/ArticleMeta";
import Comments from "~/components/ArticleDetail/Comments";
import { CommentForm } from "~/components/ArticleDetail/CommentForm";
import { throwApiError } from "~/libs/api/errors";

export async function loader({ params, context }: Route.LoaderArgs) {
  const slug = params.slug;

  if (!slug) {
    return {
      article: null,
    };
  }

  const [res, commentsRes] = await Promise.all([
    context.get(apiClientContext).GET("/articles/{slug}", {
      params: {
        path: {
          slug,
        },
      },
    }),
    context.get(apiClientContext).GET("/articles/{slug}/comments", {
      params: {
        path: {
          slug,
        },
      },
    }),
  ]);
  if (res.error) throwApiError(res.error);
  if (commentsRes.error) throwApiError(commentsRes.error);

  const article = res.data?.article;
  const comments = commentsRes.data?.comments;

  // parse html
  const processedContent = await remark().use(html).process(article?.body);
  const contentHtml = processedContent.toString();

  return {
    article,
    comments,
    contentHtml,
  };
}

export default () => {
  const { article, comments, contentHtml } = useLoaderData<typeof loader>();
  const author = article?.author;
  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article?.title}</h1>

          <ArticleMeta article={article!} />
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={{ __html: contentHtml || "" }}></div>
            <ul className="tag-list">
              {article?.tagList.map((tag) => {
                return (
                  <li key={tag} className="tag-default tag-pill tag-outline">
                    {tag}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <ArticleMeta article={article!} />
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            <CommentForm />

            <Comments comments={comments}></Comments>
          </div>
        </div>
      </div>
    </div>
  );
};

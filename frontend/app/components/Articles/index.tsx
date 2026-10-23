import { Article } from "~/components/Article";
import { Pagination } from "~/components/Pagination";
import type { components } from "~/consts/schema";


type Article = Omit<components["schemas"]["Article"], "body">

export default ({
  articles,
  page,
  size,
  total,
}: {
  articles?: Article[];
  page: number;
  size: number;
  total: number;
}) => {
  return (
    <>
      {articles?.length ? (
        articles.map((article) => {
          return (
            <Article
              key={article.slug}
              article={article}
            />
          );
        })
      ) : (
        <div className="article-list-empty" role="status">
          <h2>No articles yet</h2>
          <p>Try another topic or check back later.</p>
        </div>
      )}

      <Pagination page={page} size={size} total={total} />
    </>
  );
};

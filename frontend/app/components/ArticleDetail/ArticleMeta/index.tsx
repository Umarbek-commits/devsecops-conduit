import dayjs from "dayjs";
import { DeleteArticle } from "../DeleteArticle";
import { FollowButton } from "~/components/FollowButton";
import { FavoriteButton } from "~/components/FavoriteButton";

import { Avatar } from "~/components/Avatar";
import type { components } from "~/consts/schema";
import { Link } from "react-router";
import { useUser } from "~/hooks/useUser";

export default function ArticleMeta({
  article,
}: {
  article?: components["schemas"]["Article"];
}) {
  const author = article?.author;

  const user = useUser();
  const isAuthor = user?.username === author?.username;

  return (
    <div className="article-meta">
      <Link to={`/profile/${author?.username}`}>
        <Avatar src={author?.image} />
      </Link>
      <div className="info">
        <Link to={`/profile/${author?.username}`} className="author">
          {author?.username}
        </Link>
        <time className="date" dateTime={article?.createdAt}>
          {article?.createdAt ? dayjs(article.createdAt).format("MMMM D, YYYY") : ""}
        </time>
      </div>
      {!isAuthor ? <FollowButton profile={author!} /> : null}
      &nbsp;&nbsp;
      <FavoriteButton
        count={article?.favoritesCount}
        slug={article?.slug!}
        favorite={article?.favorited}
      />
      {isAuthor ? (
        <>
          <Link
            className="btn btn-sm btn-outline-secondary"
            to={`/editor/${article?.slug}`}
          >
            <i aria-hidden="true" className="ion-edit"></i> Edit Article
          </Link>
          <DeleteArticle />
        </>
      ) : null}
    </div>
  );
}

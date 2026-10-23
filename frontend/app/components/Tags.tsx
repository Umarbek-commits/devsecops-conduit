import { Link } from "react-router";

export default ({ tags, link }: { tags?: string[]; link?: boolean }) => {
  if (!tags?.length) return null;

  return (
    <div className="tag-list">
      {tags.map((tag) =>
        link ? (
          <Link
            key={tag}
            className="tag-pill tag-default"
            to={`/?${new URLSearchParams({ tag }).toString()}`}
          >
            {tag}
          </Link>
        ) : (
          <span key={tag} className="tag-pill tag-default">
            {tag}
          </span>
        ),
      )}
    </div>
  );
};

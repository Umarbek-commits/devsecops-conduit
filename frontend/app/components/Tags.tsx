import clsx from "clsx";
import { useLocation, useNavigate } from "react-router";


export default ({ tags, link }: { tags?: string[]; link?: boolean }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate()
  if (!tags?.length) {
    return null;
  }
  return (
    <>
      {tags.length ? (
        <div className="tag-list">
          {tags.map((tag) => {
            return (
              <a
                key={tag}
                className={clsx(
                  "tag-pill tag-default",
                  link ? "cursor-pointer" : ""
                )}
                onClick={() => {
                  if (link) {
                    const searchParams = new URLSearchParams({ tag });
                    navigate(`${pathname}?${searchParams.toString()}`);
                  }
                }}
              >
                {tag}
              </a>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

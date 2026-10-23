import dayjs from "dayjs";
import { Avatar } from "~/components/Avatar";
import type { components } from "~/consts/schema";
import { useUser } from "~/hooks/useUser";
import {DeleteComment} from "../DeleteComment";

export default ({
  comments,
}: {
  comments?: components["schemas"]["Comment"][];
}) => {
  const currentUser = useUser();

  if (!comments?.length) {
    return (
      <p className="comment-empty" role="status">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <>
      {comments?.map((comment) => {
        return (
          <div className="card" key={comment.id}>
            <div className="card-block">
              <p className="card-text">{comment.body}</p>
            </div>
            <div className="card-footer">
              <a
                href={`/profile/${comment.author.username}`}
                className="comment-author"
              >
                <Avatar
                  src={comment.author.image}
                  className="comment-author-img"
                  alt=""
                />
              </a>
              &nbsp;
              <a
                href={`/profile/${comment.author.username}`}
                className="comment-author"
              >
                {comment.author.username}
              </a>
              <time className="date-posted" dateTime={comment.createdAt}>
                {dayjs(comment.createdAt).format("MMM D, YYYY")}
              </time>
              {currentUser?.username === comment.author.username ? (
                <DeleteComment id={comment.id} />
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
};

import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingButton } from "~/components/LoadingButton";
import { Avatar } from "~/components/Avatar";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useUser } from "~/hooks/useUser";
import { useFetcher } from "~/hooks/useFetcher";

export const CommentForm = () => {
  const { fetcher, errors, fieldErrors, formRef, isLoading, formState } =
    useFetcher<{body: string}>();

  const { slug } = useParams<{ slug: string }>();
  const user = useUser();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.errors?.length === 0) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data, formRef]);

  return (
    <>
      <ErrorMessage errors={errors} />

      <fetcher.Form
        className="card comment-form"
        ref={formRef}
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const formData = new FormData(formRef.current!);
          fetcher.submit(
            {
              ...Object.fromEntries(formData),
              slug: slug!,
            },
            {
              method: "post",
              action: "/api/comment",
              encType: "application/json",
            }
          );
        }}
      >
        <div className="card-block">
          <textarea
            name="body"
            className="form-control"
            placeholder="Write a comment..."
            rows={3}
            required
            defaultValue={formState?.body || ""}
          ></textarea>
        </div>
        <ErrorMessage errors={fieldErrors?.body} />

        <div className="card-footer">
          <Avatar src={user?.image} className="comment-author-img" />
          <LoadingButton loading={isLoading}>Post Comment</LoadingButton>
        </div>
      </fetcher.Form>
    </>
  );
};

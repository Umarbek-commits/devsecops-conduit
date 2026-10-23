import { useParams } from "react-router";
import { useFetcher } from "~/hooks/useFetcher";
import { ErrorMessage } from "~/components/ErrorMessage";

export const DeleteComment = ({ id }: { id: number}) => {
  const { slug } = useParams();
  const { fetcher, isLoading, formRef, errors } = useFetcher();
  return (
    <>
      <fetcher.Form method="post" className="inline" ref={formRef}>
        <span className="mod-options">
          <button
            type="button"
            aria-label="Delete comment"
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this comment?")) {
                fetcher.submit(
                  { slug: slug!, id },
                  {
                    method: "post",
                    action: "/api/delete-comment",
                    encType: "application/json",
                  },
                );
              }
            }}
          >
            <i aria-hidden="true" className="ion-trash-a"></i>
          </button>
        </span>
      </fetcher.Form>
      <ErrorMessage errors={errors} />
    </>
  );
};

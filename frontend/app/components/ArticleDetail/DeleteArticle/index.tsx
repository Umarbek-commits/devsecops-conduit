import { useParams } from "react-router";
import { useFetcher } from "~/hooks/useFetcher";
import { ErrorMessage } from "~/components/ErrorMessage";

export const DeleteArticle = () => {
  const { slug } = useParams();
  const { fetcher, isLoading, formRef, errors } = useFetcher();
  return (
    <>
      <fetcher.Form method="post" className="inline" ref={formRef}>
        <button
          type="button"
          aria-busy={isLoading}
          className="btn btn-sm btn-outline-danger"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (confirm("Are you sure want to delete the article?")) {
              fetcher.submit(
                {
                  slug: slug!,
                },
                {
                  method: "post",
                  action: "/api/delete-article",
                  encType: "application/json",
                }
              );
            }
          }}
          name="slug"
          value={slug}
          disabled={isLoading}
        >
          <i className="ion-trash-a"></i> Delete Article
        </button>
      </fetcher.Form>
      <ErrorMessage errors={errors} />
    </>
  );
};

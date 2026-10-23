import { redirect, useLoaderData, useParams } from "react-router";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useFetcher } from "~/hooks/useFetcher";
import type { components } from "~/consts/schema";
import type { Route } from "../+types/article.$slug";
import { useEffect, useRef, useState } from "react";
import { inputsSchema } from "~/libs/schemas/newArticle";
import { omitBy } from "lodash-es";
import { authMiddleware } from "~/middlewares/auth";
import { apiClientContext } from "~/context/apiClient";
import { getApiErrorMessages, throwApiError } from "~/libs/api/errors";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware as unknown as Route.MiddlewareFunction];

export async function loader({ params, context }: Route.LoaderArgs) {
  const slug = params.slug;

  if (!slug) {
    return {
      article: null,
    };
  }

  const apiClient = context.get(apiClientContext);
  const userRes = await apiClient.GET("/user");
  const currentUser = userRes.data?.user;
  if (!currentUser) {
    throw redirect("/login");
  }

  const res = await apiClient.GET("/articles/{slug}", {
    params: {
      path: {
        slug,
      },
    },
  });
  if (res.error) throwApiError(res.error);

  const article = res.data?.article;

  const isAuthor = currentUser?.username === article?.author?.username;

  if (!isAuthor) {
    throw redirect(`/article/${slug}`);
  }

  return {
    article,
    isAuthor,
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  let formData = await request.formData();
  const slug = params.slug;
  const data = Object.fromEntries(formData);
  const { tagList, ...updateData } = data as Omit<
    components["schemas"]["NewArticle"],
    "tagList"
  > & {
    tagList: string;
  };
  const result = inputsSchema.safeParse(
    omitBy(
      {
        ...updateData,
        tagList: tagList?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      },
      (value) => {
        if (!value) {
          return true;
        }
        return false;
      }
    )
  );

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      formState: updateData,
      errors: undefined,
    };
  }

  const fetchParams = {
    body: {
      article: result.data,
    },
  };

  try {
    const res = await(
      slug
        ? context.get(apiClientContext).PUT("/articles/{slug}", {
            ...fetchParams,
            params: {
              path: {
                slug,
              },
            },
          })
        : context.get(apiClientContext).POST("/articles", fetchParams)
    );

    if (res.error) {
      return {
        errors: getApiErrorMessages(res.error),
        formState: updateData,
      };
    }

    return redirect(`/article/${res.data?.article.slug}`);
  } catch (error) {
    return {
      errors: getApiErrorMessages(error),
      formState: updateData,
    };
  }
}

export default () => {
  const { article } = useLoaderData<typeof loader>();
  const { fetcher, isLoading, errors, formState, fieldErrors } =
    useFetcher<components["schemas"]["NewArticle"]>();

  const { slug } = useParams();

  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagListRef = useRef<HTMLInputElement>(null);
  const [tagList, setTagList] = useState<string[]>(article?.tagList ?? []);

  useEffect(() => {
    setTagList(article?.tagList ?? []);
  }, [article?.slug]);

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <header className="editor-heading">
              <p className="eyebrow">Your writing</p>
              <h1>{slug ? "Edit your article" : "Create an article"}</h1>
              <p>Write in Markdown. Add tags to help readers find your story.</p>
            </header>
            <ErrorMessage errors={errors} />

            <fetcher.Form method="post">
              <fieldset>
                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="article-title">
                    Article title
                  </label>
                  <input
                    id="article-title"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Article Title"
                    name="title"
                    required
                    defaultValue={formState?.title || article?.title}
                  />
                </fieldset>
                <ErrorMessage errors={fieldErrors?.title} />
                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="article-description">
                    Article description
                  </label>
                  <input
                    id="article-description"
                    type="text"
                    className="form-control"
                    placeholder="What's this article about?"
                    name="description"
                    required
                    defaultValue={
                      formState?.description || article?.description
                    }
                  />
                </fieldset>
                <ErrorMessage errors={fieldErrors?.description} />
                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="article-body">
                    Article body in Markdown
                  </label>
                  <textarea
                    id="article-body"
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    name="body"
                    required
                    defaultValue={formState?.body || article?.body}
                  ></textarea>
                </fieldset>
                <ErrorMessage errors={fieldErrors?.body} />

                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="article-tags">
                    Add a tag and press Enter
                  </label>
                  <input
                    id="article-tags"
                    ref={tagInputRef}
                    type="text"
                    className="form-control"
                    placeholder="Enter tags"
                    onKeyDown={(e) => {
                      e.stopPropagation();

                      if (e.key === "Enter") {
                        const newTagList = tagList.slice();
                        const value = e.currentTarget.value.trim();

                        if (value && !newTagList.includes(value)) {
                          newTagList.push(value);
                          e.currentTarget.value = "";
                          setTagList(newTagList);
                        }
                        e.preventDefault();
                      }
                    }}
                  />
                  <input
                    ref={tagListRef}
                    type="hidden"
                    name="tagList"
                    value={tagList.join(",")}
                    readOnly
                  />
                  <div className="tag-list">
                    <div className="tag-list">
                      {tagList.map((tag) => (
                        <span key={tag} className="tag-default tag-pill">
                          <button
                            type="button"
                            aria-label={`Remove ${tag} tag`}
                            onClick={() => {
                              setTagList((list) =>
                                list.filter((value) => value !== tag),
                              );
                            }}
                          >
                            <span aria-hidden="true">×</span>
                          </button>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </fieldset>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-lg pull-xs-right btn-primary"
                  aria-busy={isLoading}
                >
                  {isLoading
                    ? "loading"
                    : `${slug ? "Update" : "Publish"} Article`}
                </button>
              </fieldset>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
};

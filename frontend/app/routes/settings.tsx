import { redirect, useLoaderData } from "react-router";
import { omitBy } from "lodash-es";

import type { Route } from "../+types/root";
import { useFetcher } from "~/hooks/useFetcher";
import { inputsSchema, type Inputs } from "~/libs/schemas/settings";
import type { components } from "~/consts/schema";
import { destroySession, getSession } from "~/session.server";
import { ErrorMessage } from "~/components/ErrorMessage";
import { userContext } from "~/context/user";
import { apiClientContext } from "~/context/apiClient";
import { getApiErrorMessages } from "~/libs/api/errors";
import { PasswordInput } from "~/components/PasswordInput";
import { SuccessMessage } from "~/components/SuccessMessage";

export const loader = ({ context }: Route.LoaderArgs) => {
  const user = context.get(userContext);

  return { user };
};

export async function action({ request, context }: Route.ActionArgs) {
  let formData = await request.formData();
  const data = Object.fromEntries(formData);
  const { intent, ...updateData } = data;

  switch (intent) {
    case "logout": {
      const session = await getSession(request.headers.get("Cookie"));
      return redirect("/", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }
    case "update": {
      const result = inputsSchema.safeParse(updateData);

      if (!result.success) {
        return {
          fieldErrors: result.error.flatten().fieldErrors,
          formState: updateData,
          errors: undefined,
        };
      }

      try {
        const res = await context.get(apiClientContext).PUT("/user", {
          body: {
            user: omitBy(result.data, (value, key) => {
              if (key === "password" && !value) {
                return true;
              }
              return false;
            }) as components["schemas"]["User"],
          },
        });

        if (res.error) {
          return {
            errors: getApiErrorMessages(res.error),
            formState: updateData,
          };
        }

        return {
          formState: updateData,
          errors: [],
          success: "settings-saved",
        };
      } catch (error) {
        return {
          errors: getApiErrorMessages(error),
          formState: updateData,
        };
      }
    }
    default: {
      throw Error("unknown intent" + intent);
    }
  }
}

export default () => {
  const { fetcher, isLoading, errors, formState, fieldErrors } = useFetcher<
    Inputs,
    components["schemas"]["User"]
  >();
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <p className="settings-intro">
              Keep your public profile and sign-in details up to date.
            </p>

            <ErrorMessage errors={errors} />
            <SuccessMessage
              message={
                fetcher.state === "idle" && fetcher.data?.success
                  ? "Settings saved."
                  : undefined
              }
            />

            <fetcher.Form method="post">
              <fieldset>
                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="settings-image">
                    Profile image URL
                  </label>
                  <input
                    id="settings-image"
                    className="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    name="image"
                    autoComplete="url"
                    defaultValue={formState?.image ?? user?.image}
                  />
                </fieldset>
                <ErrorMessage errors={fieldErrors?.image} />

                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="settings-username">
                    Username
                  </label>
                  <input
                    id="settings-username"
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    name="username"
                    autoComplete="username"
                    required
                    aria-invalid={Boolean(fieldErrors?.username?.length)}
                    aria-describedby={
                      fieldErrors?.username?.length
                        ? "settings-username-error"
                        : undefined
                    }
                    defaultValue={formState?.username ?? user?.username}
                  />
                </fieldset>
                <ErrorMessage
                  id="settings-username-error"
                  errors={fieldErrors?.username}
                />

                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="settings-bio">
                    Short bio
                  </label>
                  <textarea
                    id="settings-bio"
                    className="form-control form-control-lg"
                    rows={8}
                    placeholder="Short bio about you"
                    name="bio"
                    defaultValue={formState?.bio ?? user?.bio}
                  ></textarea>
                </fieldset>
                <ErrorMessage errors={fieldErrors?.bio} />

                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="settings-email">
                    Email address
                  </label>
                  <input
                    id="settings-email"
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    name="email"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(fieldErrors?.email?.length)}
                    aria-describedby={
                      fieldErrors?.email?.length
                        ? "settings-email-error"
                        : undefined
                    }
                    defaultValue={formState?.email ?? user?.email}
                  />
                </fieldset>
                <ErrorMessage
                  id="settings-email-error"
                  errors={fieldErrors?.email}
                />

                <fieldset className="form-group">
                  <label className="sr-only" htmlFor="settings-password">
                    New password
                  </label>
                  <PasswordInput
                    id="settings-password"
                    className="form-control form-control-lg"
                    placeholder="New Password"
                    name="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors?.password?.length)}
                    aria-describedby={
                      fieldErrors?.password?.length
                        ? "settings-password-error"
                        : undefined
                    }
                    defaultValue={formState?.password || ""}
                  />
                </fieldset>
                <ErrorMessage
                  id="settings-password-error"
                  errors={fieldErrors?.password}
                />

                <button
                  disabled={isLoading}
                  type="submit"
                  name="intent"
                  value="update"
                  className="btn btn-lg btn-primary pull-xs-right"
                  aria-busy={isLoading}
                >
                  Update Settings
                </button>
              </fieldset>
            </fetcher.Form>
            <hr />
            <fetcher.Form method="post">
              <button
                type="submit"
                name="intent"
                value="logout"
                className="btn btn-outline-danger"
                disabled={isLoading}
              >
                Sign out
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
};

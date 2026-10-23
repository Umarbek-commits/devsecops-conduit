import { Link, redirect } from "react-router";

import type { Route } from "../+types/root";
import { inputsSchema, type Inputs } from "~/libs/schemas/register";
import { useFetcher } from "~/hooks/useFetcher";
import type { components } from "~/consts/schema";
import { checkIsLogin, commitSession, getSession } from "~/session.server";
import { ErrorMessage } from "~/components/ErrorMessage";
import { getApiErrorMessages } from "~/libs/api/errors";
import { apiClientContext } from "~/context/apiClient";
import { PasswordInput } from "~/components/PasswordInput";

export async function loader({ request }: Route.LoaderArgs) {
  if (await checkIsLogin(request)) {
    return redirect("/");
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const data = Object.fromEntries(await request.formData());
  const result = inputsSchema.safeParse(data);

  if (!result.success) {
    return {
      formState: data,
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }
  try {
    const res = await context.get(apiClientContext).POST("/users", {
      body: {
        user: result.data,
      },
    });

    if (res.error) {
      return {
        formState: data,
        errors: getApiErrorMessages(res.error),
      };
    }

    const session = await getSession(request.headers.get("Cookie"));
    session.set("token", res.data?.user.token!);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    return {
      formState: data,
      errors: getApiErrorMessages(error),
    };
  }
}

export default () => {
  const { errors, fieldErrors, formState, fetcher, isLoading } = useFetcher<
    Inputs,
    components["schemas"]["User"]
  >();

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign up</h1>
            <p className="text-xs-center">
              <Link to="/login">Have an account?</Link>
            </p>

            <ErrorMessage errors={errors} />

            <fetcher.Form method="post">
              <fieldset className="form-group">
                <label className="sr-only" htmlFor="register-username">
                  Username
                </label>
                <input
                  id="register-username"
                  className="form-control form-control-lg"
                  type="text"
                  placeholder="Username"
                  name="username"
                  autoComplete="username"
                  required
                  aria-invalid={Boolean(fieldErrors?.username?.length)}
                  aria-describedby={
                    fieldErrors?.username?.length
                      ? "register-username-error"
                      : undefined
                  }
                  defaultValue={formState?.username}
                />
              </fieldset>
              <ErrorMessage
                id="register-username-error"
                errors={fieldErrors?.username}
              />

              <fieldset className="form-group">
                <label className="sr-only" htmlFor="register-email">
                  Email address
                </label>
                <input
                  id="register-email"
                  className="form-control form-control-lg"
                  type="email"
                  placeholder="Email"
                  name="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(fieldErrors?.email?.length)}
                  aria-describedby={
                    fieldErrors?.email?.length ? "register-email-error" : undefined
                  }
                  defaultValue={formState?.email}
                />
              </fieldset>
              <ErrorMessage
                id="register-email-error"
                errors={fieldErrors?.email}
              />

              <fieldset className="form-group">
                <label className="sr-only" htmlFor="register-password">
                  Password
                </label>
                <PasswordInput
                  id="register-password"
                  className="form-control form-control-lg"
                  placeholder="Password"
                  name="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(fieldErrors?.password?.length)}
                  aria-describedby={
                    fieldErrors?.password?.length
                      ? "register-password-error"
                      : undefined
                  }
                  defaultValue={formState?.password}
                />
              </fieldset>
              <ErrorMessage
                id="register-password-error"
                errors={fieldErrors?.password}
              />

              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-lg btn-primary pull-xs-right"
                aria-busy={isLoading}
              >
                {isLoading ? "Loading" : "Sign up"}
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Await, Outlet, useLoaderData, useLocation } from "react-router";
import { Suspense } from "react";

import { useUser } from "~/hooks/useUser";
import { Tabs } from "~/components/Tabs";
import { apiClientContext } from "~/context/apiClient";
import Tags from "~/components/Tags";
import type { Route } from "./+types";
import TagLoading from "./TagLoading";
import { throwApiError } from "~/libs/api/errors";

export async function loader({ request, context }: Route.LoaderArgs) {
  const res = await context.get(apiClientContext).GET("/tags");
  if (res.error) throwApiError(res.error);

  return {
    tags: res.data?.tags || [],
  };
}

export default function Home() {
  const user = useUser();

  const { tags } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  const tabs = [
    {
      name: "Global Feed",
      href: "/",
      show: true,
    },
    {
      name: "Your Feed",
      href: "/feed",
      show: !!user,
    },
  ].filter((item) => item.show);

  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <span className="hero-brand">conduit</span>
          <p className="eyebrow">A community for curious minds</p>
          <h1>Ideas worth sharing.</h1>
          <p>Read thoughtful stories, learn from others, and share what you know.</p>
        </div>
      </div>

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <Tabs tabs={tabs} />
            </div>

            <Outlet />
          </div>

          <div className="col-md-3">
            <Suspense fallback={<TagLoading />}>
              <Await resolve={tags}>
                {(tags) => {
                  return (
                    <div className="sidebar">
                      <p>Explore topics</p>
                      <Tags link={pathname === "/"} tags={tags} />
                    </div>
                  );
                }}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}


export function HydrateFallback() {
  return <p>Loading Articles...</p>;
}

import type { components } from "~/consts/schema";
import { useFetcher } from "~/hooks/useFetcher";
import { ErrorMessage } from "~/components/ErrorMessage";
import { SuccessMessage } from "~/components/SuccessMessage";

export const FollowButton = ({
  profile,
}: {
  profile: components["schemas"]["Profile"];
}) => {
  const { fetcher, isLoading, errors } = useFetcher();
  return (
    <>
      <fetcher.Form method="post" className="inline" action="/api/follow">
        <input type="hidden" name="username" value={profile?.username} />
        <input
          type="hidden"
          name="action"
          value={profile?.following ? "unfollow" : "follow"}
        />
        <button
          disabled={isLoading}
          type="submit"
          aria-pressed={Boolean(profile?.following)}
          className="btn btn-sm btn-outline-secondary action-btn"
        >
          <i className="ion-plus-round"></i>
          &nbsp; {profile?.following ? "UnFollow" : "Follow"} {profile?.username}
        </button>
      </fetcher.Form>
      <ErrorMessage errors={errors} />
      <SuccessMessage
        message={
          fetcher.state === "idle" && fetcher.data?.success === "follow"
            ? `You are now following ${profile.username}.`
            : fetcher.state === "idle" && fetcher.data?.success === "unfollow"
              ? `You unfollowed ${profile.username}.`
              : undefined
        }
      />
    </>
  );
};

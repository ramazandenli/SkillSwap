import { Link } from "react-router-dom";
import Panel from "../ui/Panel.js";
import Avatar from "../ui/Avatar.js";
import { AsyncBoundary, Empty } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as usersApi from "../../api/users.js";
import * as followsApi from "../../api/follows.js";

/**
 * Takipciler ve takip edilenler.
 *
 * Bu ikisi de Home.js icinde ayri ayri yazilmisti. Aralarindaki tek anlamli
 * fark, takibi birakirken hangi tarafin "follower" hangi tarafin "followed"
 * oldugu. Onu asagida tek bir kosulla hallediyoruz.
 */
function FollowPanel({ username, direction }) {
  const isFollowing = direction === "followings";
  const title = isFollowing ? "Takip ettiklerim" : "Takipcilerim";

  const { data, loading, error, reload } = useAsyncData(
    () => (isFollowing ? usersApi.getFollowings(username) : usersApi.getFollowers(username)),
    [username, direction]
  );

  async function handleRemove(otherUser) {
    // Iliskinin diger ucunu ve yonunu bildiriyoruz; kendi kullanici adimizi
    // gondermiyoruz, sunucu onu token'dan okuyor.
    await followsApi.unfollow(otherUser, isFollowing ? "following" : "follower");
    reload();
  }

  const users = data ?? [];

  return (
    <Panel title={title} className="follow-panel">
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {users.length === 0 ? (
          <Empty>{isFollowing ? "Kimseyi takip etmiyorsun." : "Henuz takipcin yok."}</Empty>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.user_id} className="user-list__item">
                <Avatar username={user.user_id} size="sm" />
                <span className="user-list__name">{user.user_id}</span>
                <Link
                  to={`/messages/${username}/${user.user_id}`}
                  className="btn btn--ghost btn--sm"
                >
                  Mesaj
                </Link>
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => handleRemove(user.user_id)}
                >
                  Cikar
                </button>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </Panel>
  );
}

export default FollowPanel;

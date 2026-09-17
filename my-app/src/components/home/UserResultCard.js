import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar.js";
import SkillTag from "../ui/SkillTag.js";
import StarRating from "../ui/StarRating.js";
import EventRequestModal from "./EventRequestModal.js";
import { AsyncBoundary } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as usersApi from "../../api/users.js";
import * as followsApi from "../../api/follows.js";

/**
 * Arama sonucundaki tek kullanici karti.
 *
 * Profil, yetenekler ve ortalama puan tek istekte geliyor
 * (GET /api/users/:id). Eskiden bu kart ayni kullanici icin ayri ayri
 * profil / has / needs istekleri atiyordu; on sonuclu bir aramada bu
 * otuz istek demekti.
 */
function UserResultCard({ loggedUser, username, searchedSkillId, isFollowing, onFollowChanged }) {
  const { data, loading, error, reload } = useAsyncData(
    () => usersApi.getUserDetail(username),
    [username]
  );

  const [followError, setFollowError] = useState(null);

  async function toggleFollow() {
    try {
      setFollowError(null);

      if (isFollowing) {
        await followsApi.unfollow(username, "following");
      } else {
        await followsApi.follow(username);
      }

      onFollowChanged();
    } catch (toggleError) {
      setFollowError(toggleError.message);
    }
  }

  return (
    <article className="result-card">
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <header className="result-card__header">
              <Avatar username={username} size="md" />
              <div className="result-card__identity">
                <p className="result-card__name">
                  {data.profile.name} {data.profile.surname}
                </p>
                <p className="result-card__handle">@{username}</p>
              </div>
              <div className="result-card__score">
                <span className="result-card__points">{data.profile.points} puan</span>
                {data.average_rating !== null && (
                  <span className="result-card__rating">
                    <StarRating value={data.average_rating} size="sm" />
                    {data.average_rating}
                  </span>
                )}
              </div>
            </header>

            <SkillGroup label="Sahip" tone="positive" skills={data.hasSkills} />
            <SkillGroup label="Ihtiyac" tone="accent" skills={data.needSkills} />

            <footer className="result-card__actions">
              <button
                type="button"
                className={isFollowing ? "btn btn--ghost btn--sm" : "btn btn--outline btn--sm"}
                onClick={toggleFollow}
              >
                {isFollowing ? "Takibi birak" : "Takip et"}
              </button>

              <Link to={`/messages/${loggedUser}/${username}`} className="btn btn--ghost btn--sm">
                Mesaj
              </Link>

              <EventRequestModal
                type="exchanges"
                loggedUser={loggedUser}
                targetUser={username}
                targetSkillId={searchedSkillId}
                targetNeeds={data.needSkills}
              />
              <EventRequestModal
                type="teaches"
                loggedUser={loggedUser}
                targetUser={username}
                targetSkillId={searchedSkillId}
                targetNeeds={data.needSkills}
              />
            </footer>

            {followError && <p className="state state--error">{followError}</p>}
          </>
        )}
      </AsyncBoundary>
    </article>
  );
}

function SkillGroup({ label, tone, skills }) {
  if (skills.length === 0) return null;

  return (
    <div className="result-card__skills">
      <span className="result-card__skills-label">{label}</span>
      <div className="tag-list">
        {skills.map((skill) => (
          <SkillTag key={skill.skill_id} name={skill.skill_name} tone={tone} />
        ))}
      </div>
    </div>
  );
}

export default UserResultCard;

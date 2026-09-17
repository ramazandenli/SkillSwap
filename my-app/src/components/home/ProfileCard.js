import Panel from "../ui/Panel.js";
import Avatar from "../ui/Avatar.js";
import StarRating from "../ui/StarRating.js";
import { AsyncBoundary } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as usersApi from "../../api/users.js";

/**
 * Ust taraftaki profil karti: kimlik bilgileri, puan, takipci sayaclari ve
 * ortalama degerlendirme. Hepsi tek istekten geliyor
 * (GET /api/users/:id/profile), eskiden profil ve sayaclar icin iki ayri
 * istek atiliyordu.
 */
function ProfileCard({ username, refreshToken = 0 }) {
  // refreshToken degisince veri yeniden cekiliyor. Etkinlik kabul edilince
  // puanlar veritabanindaki trigger ile degistigi icin, kabul isleminden
  // sonra Home bu sayaci artirip profili tazeliyor.
  const { data: profile, loading, error, reload } = useAsyncData(
    () => usersApi.getProfile(username),
    [username, refreshToken]
  );

  return (
    <Panel className="profile-card">
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {profile && (
          <>
            <div className="profile-card__identity">
              <Avatar username={profile.user_id} size="lg" />
              <div>
                <h1 className="profile-card__name">
                  {profile.name} {profile.surname}
                </h1>
                <p className="profile-card__handle">@{profile.user_id}</p>
                {profile.average_rating !== null ? (
                  <p className="profile-card__rating">
                    <StarRating value={profile.average_rating} size="sm" />
                    <span>
                      {profile.average_rating} ({profile.review_count} degerlendirme)
                    </span>
                  </p>
                ) : (
                  <p className="profile-card__rating profile-card__rating--empty">
                    Henuz degerlendirilmemis
                  </p>
                )}
              </div>
            </div>

            <dl className="profile-card__stats">
              <Stat label="Puan" value={profile.points} highlight />
              <Stat label="Takipci" value={profile.followers_count} />
              <Stat label="Takip" value={profile.followings_count} />
            </dl>

            <dl className="profile-card__details">
              <Detail label="Dogum tarihi" value={profile.birthdate} />
              <Detail label="Cinsiyet" value={profile.gender === "M" ? "Erkek" : "Kadin"} />
            </dl>
          </>
        )}
      </AsyncBoundary>
    </Panel>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div className={highlight ? "stat stat--highlight" : "stat"}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default ProfileCard;

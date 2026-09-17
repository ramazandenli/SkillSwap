import { useReducer } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext.js";

import AppShell from "../components/layout/AppShell.js";
import ProfileCard from "../components/home/ProfileCard.js";
import SkillsPanel from "../components/home/SkillsPanel.js";
import FollowPanel from "../components/home/FollowPanel.js";
import EventsPanel from "../components/home/EventsPanel.js";
import SearchPanel from "../components/home/SearchPanel.js";
import PendingReviewsPanel from "../components/reviews/PendingReviewsPanel.js";
import ReviewList from "../components/reviews/ReviewList.js";
import { AsyncBoundary } from "../components/ui/StateMessage.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import * as skillsApi from "../api/skills.js";
import * as usersApi from "../api/users.js";
import "../styles/home.css";

/**
 * Adres kontrolu.
 *
 * Bu sayfa duzenleme kontrolleri iceriyor ve isteklerini adresteki kullanici
 * adiyla atiyor. Kontrol olmasaydi baskasinin adresini elle yazan biri onun
 * yetenek listesini degistirebilirdi.
 *
 * Kontrol neden ayri bir bilesende: React kancalari her render'da ayni sirada
 * calismak zorunda. Yonlendirmeyi HomeContent'in basina koysaydik
 * kancalardan once return etmis olurduk. Ince bir sarmalayici hem bu kurali
 * bozmuyor hem de yanlis kullanici icin bosuna istek atilmasini engelliyor.
 *
 * Asil koruma sunucuda: /api rotalari JWT ile korunuyor ve yazma islemleri
 * requireSelf'ten geciyor, yani bu kontrol atlansa bile sunucu baskasinin
 * verisini degistirtmez. Buradaki kontrol arayuzun tutarli kalmasi ve
 * kullaniciya bos yere 403 gostermemek icin.
 */
function Home() {
  const { username } = useParams();
  const { username: sessionUsername } = useAuth();

  if (username !== sessionUsername) {
    return <Navigate to={`/home/${sessionUsername}`} replace />;
  }

  return <HomeContent username={username} />;
}

/**
 * Ana sayfa.
 *
 * Eskiden bu dosya 580 satirdi ve profil, yetenekler, takip, etkinlikler ve
 * aramanin tamami tek bilesenin icindeydi (yirmi kusur useState). Simdi
 * sayfanin isi sadece duzeni kurmak ve panellerin ortak ihtiyac duydugu uc
 * veriyi (yetenek katalogu, sahip olunanlar, ihtiyac duyulanlar) yukaridan
 * dagitmak.
 *
 * Bu uc veri neden yukarida: yetenek ekleyip cikarmak iki paneli birden
 * etkiliyor (bir yetenek "sahip" listesine girince "ihtiyac" listesinin
 * seceneklerinden cikmali). Ortak veri, onu paylasan panellerin en yakin
 * ortak atasinda duruyor.
 */
function HomeContent({ username }) {
  // Etkinlik kabul edilince puanlar veritabanindaki trigger ile degisiyor;
  // sayaci artirmak profil kartini ve degerlendirme listesini tazeliyor.
  const [profileToken, refreshProfile] = useReducer((token) => token + 1, 0);

  const catalog = useAsyncData(() => skillsApi.listSkills(), []);
  const owned = useAsyncData(() => usersApi.getSkills(username, "has"), [username]);
  const needed = useAsyncData(() => usersApi.getSkills(username, "needs"), [username]);

  const ownedSkills = owned.data ?? [];
  const neededSkills = needed.data ?? [];

  // Iki listede de bulunan yetenekler tekrar secilemesin diye tek kumede.
  const usedSkillIds = new Set(
    [...ownedSkills, ...neededSkills].map((skill) => skill.skill_id)
  );

  function reloadSkillLists() {
    owned.reload();
    needed.reload();
  }

  return (
    <AppShell
      nav={
        <Link to={`/messages/${username}`} className="btn btn--ghost btn--sm">
          Mesajlar
        </Link>
      }
    >
      <div className="home">
        <div className="home__column">
          <ProfileCard username={username} refreshToken={profileToken} />

          <AsyncBoundary
            loading={catalog.loading || owned.loading || needed.loading}
            error={catalog.error || owned.error || needed.error}
            onRetry={() => {
              catalog.reload();
              reloadSkillLists();
            }}
          >
            <SkillsPanel
              username={username}
              type="has"
              skills={ownedSkills}
              catalog={catalog.data ?? []}
              excludedIds={usedSkillIds}
              onChanged={reloadSkillLists}
            />
            <SkillsPanel
              username={username}
              type="needs"
              skills={neededSkills}
              catalog={catalog.data ?? []}
              excludedIds={usedSkillIds}
              onChanged={reloadSkillLists}
            />
          </AsyncBoundary>

          <FollowPanel username={username} direction="followings" />
          <FollowPanel username={username} direction="followers" />
        </div>

        <div className="home__column">
          <SearchPanel username={username} catalog={catalog.data ?? []} />
          <EventsPanel username={username} onEventResolved={refreshProfile} />
          <PendingReviewsPanel username={username} onReviewSubmitted={refreshProfile} />
          <ReviewList username={username} refreshToken={profileToken} />
        </div>
      </div>
    </AppShell>
  );
}

export default Home;

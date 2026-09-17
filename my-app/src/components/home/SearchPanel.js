import { useState } from "react";
import Panel from "../ui/Panel.js";
import UserResultCard from "./UserResultCard.js";
import { Empty, ErrorMessage, Loading } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as skillsApi from "../../api/skills.js";
import * as usersApi from "../../api/users.js";

/**
 * Yetenek arama.
 *
 * Eslesme kurali tamamen veritabaninda: aranan yetenege sahip olan VE benim
 * bildigim bir yetenege ihtiyaci olan kullanicilar donuyor. Buradaki tek
 * secim, sonucun neye gore siralanacagi:
 *   points -> kullanici puanina gore
 *   count  -> ortak ihtiyac sayisina gore
 */
function SearchPanel({ username, catalog }) {
  const [form, setForm] = useState({ skillId: "", sort: "points" });
  const [submittedSkillId, setSubmittedSkillId] = useState(null);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Takip durumunu her kart kendi basina sormuyor: listeyi bir kere burada
  // cekip asagiya kume olarak veriyoruz.
  const { data: followings, reload: reloadFollowings } = useAsyncData(
    () => usersApi.getFollowings(username),
    [username]
  );

  const followingIds = new Set((followings ?? []).map((user) => user.user_id));

  async function handleSearch(event) {
    event.preventDefault();
    if (!form.skillId) return;

    setSearching(true);
    setError(null);

    try {
      // userId gonderilmiyor: sunucu arayan kisiyi token'dan biliyor.
      const found = await skillsApi.searchUsers({
        skillId: form.skillId,
        sort: form.sort,
      });

      setResults(found);
      // Kartlardaki teklif penceresi "aradigim yetenek"i bilmeli. Form
      // degerini degil, aramanin yapildigi andaki degeri sakliyoruz.
      setSubmittedSkillId(form.skillId);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <Panel title="Yetenek ara" className="search-panel">
      <form className="search-form" onSubmit={handleSearch}>
        <label className="field">
          <span className="field__label">Aradigim yetenek</span>
          <select
            className="input"
            value={form.skillId}
            onChange={(event) => setForm({ ...form, skillId: event.target.value })}
            required
          >
            <option value="">Sec...</option>
            {catalog.map((skill) => (
              <option key={skill.skill_id} value={skill.skill_id}>
                {skill.skill_name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Siralama</span>
          <select
            className="input"
            value={form.sort}
            onChange={(event) => setForm({ ...form, sort: event.target.value })}
          >
            <option value="points">Puana gore</option>
            <option value="count">Ortak ihtiyac sayisina gore</option>
          </select>
        </label>

        <button type="submit" className="btn btn--primary" disabled={!form.skillId || searching}>
          {searching ? "Araniyor..." : "Ara"}
        </button>
      </form>

      {error && <ErrorMessage message={error} />}
      {searching && <Loading label="Eslesen kullanicilar araniyor..." />}

      {!searching && results !== null && (
        results.length === 0 ? (
          <Empty>Bu yetenek icin karsilikli eslesen bir kullanici bulunamadi.</Empty>
        ) : (
          <div className="result-list">
            {results.map((result) => (
              <UserResultCard
                key={result.user_id}
                loggedUser={username}
                username={result.user_id}
                searchedSkillId={submittedSkillId}
                isFollowing={followingIds.has(result.user_id)}
                onFollowChanged={reloadFollowings}
              />
            ))}
          </div>
        )
      )}
    </Panel>
  );
}

export default SearchPanel;

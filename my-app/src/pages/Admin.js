import { useState } from "react";
import AppShell from "../components/layout/AppShell.js";
import Panel from "../components/ui/Panel.js";
import SkillTag from "../components/ui/SkillTag.js";
import Avatar from "../components/ui/Avatar.js";
import { AsyncBoundary, Empty, ErrorMessage } from "../components/ui/StateMessage.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import * as skillsApi from "../api/skills.js";
import * as usersApi from "../api/users.js";
import * as statsApi from "../api/stats.js";
import "../styles/admin.css";

const STAT_LABELS = [
  ["user_count", "Kullanici"],
  ["skill_count", "Yetenek"],
  ["review_count", "Degerlendirme"],
  ["user_has_most_point", "En cok puanli"],
  ["most_followed_user", "En cok takip edilen"],
  ["best_rated_user", "En yuksek puanli"],
  ["most_owned_skill", "En yaygin yetenek"],
  ["most_needed_skill", "En cok aranan yetenek"],
];

/**
 * Yonetim paneli.
 *
 * Ustteki tum sayilar tek bir istekten geliyor (GET /api/stats). Sunucu
 * tarafinda bu, database.sql icindeki `stats` view'i: her sutunu ayri bir
 * alt sorgu olan tek satirlik bir gorunum. Yani sekiz farkli istatistik
 * icin sekiz sorgu degil, bir sorgu atiliyor.
 */
function Admin() {
  const stats = useAsyncData(() => statsApi.getStats(), []);
  const skills = useAsyncData(() => skillsApi.listSkills(), []);
  const users = useAsyncData(() => usersApi.listUsers(), []);

  const [newSkill, setNewSkill] = useState("");
  const [actionError, setActionError] = useState(null);

  async function runAction(action, reload) {
    try {
      setActionError(null);
      await action();
      reload();
    } catch (error) {
      setActionError(error.message);
    }
  }

  function handleAddSkill(event) {
    event.preventDefault();
    if (!newSkill.trim()) return;

    runAction(async () => {
      await skillsApi.createSkill(newSkill);
      setNewSkill("");
    }, skills.reload);
  }

  return (
    <AppShell>
      <div className="admin">
        <Panel title="Genel durum" className="admin__stats">
          <AsyncBoundary loading={stats.loading} error={stats.error} onRetry={stats.reload}>
            <dl className="stat-grid">
              {STAT_LABELS.map(([key, label]) => (
                <div key={key} className="stat">
                  <dt>{label}</dt>
                  <dd>{stats.data?.[key] ?? "-"}</dd>
                </div>
              ))}
            </dl>
          </AsyncBoundary>
        </Panel>

        {actionError && <ErrorMessage message={actionError} />}

        <Panel title="Yetenek katalogu" className="admin__skills">
          <form className="inline-form" onSubmit={handleAddSkill}>
            <input
              className="input"
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
              placeholder="Yeni yetenek adi"
              aria-label="Yeni yetenek adi"
            />
            <button type="submit" className="btn btn--primary btn--sm" disabled={!newSkill.trim()}>
              Ekle
            </button>
          </form>

          <AsyncBoundary loading={skills.loading} error={skills.error} onRetry={skills.reload}>
            <div className="tag-list">
              {(skills.data ?? []).map((skill) => (
                <SkillTag
                  key={skill.skill_id}
                  name={skill.skill_name}
                  onRemove={() =>
                    runAction(() => skillsApi.deleteSkill(skill.skill_id), skills.reload)
                  }
                />
              ))}
            </div>
          </AsyncBoundary>
        </Panel>

        <Panel title="Kullanicilar" className="admin__users">
          <AsyncBoundary loading={users.loading} error={users.error} onRetry={users.reload}>
            {(users.data ?? []).length === 0 ? (
              <Empty>Kayitli kullanici yok.</Empty>
            ) : (
              <ul className="user-list">
                {(users.data ?? []).map((user) => (
                  <li key={user.user_id} className="user-list__item">
                    <Avatar username={user.user_id} size="sm" />
                    <span className="user-list__name">{user.user_id}</span>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() =>
                        runAction(() => usersApi.deleteUser(user.user_id), users.reload)
                      }
                    >
                      Kaldir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AsyncBoundary>
        </Panel>
      </div>
    </AppShell>
  );
}

export default Admin;

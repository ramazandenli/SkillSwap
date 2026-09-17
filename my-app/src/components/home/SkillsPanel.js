import { useState } from "react";
import Panel from "../ui/Panel.js";
import SkillTag from "../ui/SkillTag.js";
import { Empty, ErrorMessage } from "../ui/StateMessage.js";
import * as usersApi from "../../api/users.js";

/**
 * "Sahip oldugu yetenekler" ve "ihtiyac duydugu yetenekler" listeleri.
 *
 * Eskiden bu iki liste, Home.js icinde ~110 satirlik neredeyse birebir ayni
 * iki JSX blogu olarak duruyordu (isAddingActive1/isAddingActive2,
 * button1/button2, isCancelDisabled1/isCancelDisabled2 gibi ikiz state'lerle).
 * Fark yalnizca hangi tabloya yazildigiydi; o farki artik type prop'u
 * tasiyor ve bilesen tek kopya.
 */
function SkillsPanel({ username, type, skills, catalog, excludedIds, onChanged }) {
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [error, setError] = useState(null);

  const isOwned = type === "has";
  const title = isOwned ? "Sahip oldugum yetenekler" : "Ogrenmek istediklerim";

  // Kullanicinin iki listesinde de bulunmayan yetenekler secilebilir olmali:
  // ayni yetenegi hem bilip hem ogrenmek istemek anlamsiz.
  const selectableSkills = catalog.filter((skill) => !excludedIds.has(skill.skill_id));

  async function handleAdd(event) {
    event.preventDefault();
    if (!selectedSkillId) return;

    try {
      setError(null);
      await usersApi.addSkill(username, Number(selectedSkillId), type);
      setSelectedSkillId("");
      onChanged();
    } catch (addError) {
      setError(addError.message);
    }
  }

  async function handleRemove(skillId) {
    try {
      setError(null);
      await usersApi.removeSkill(username, skillId, type);
      onChanged();
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return (
    <Panel title={title} className="skills-panel">
      {skills.length === 0 ? (
        <Empty>Bu listede henuz yetenek yok.</Empty>
      ) : (
        <div className="tag-list">
          {skills.map((skill) => (
            <SkillTag
              key={skill.skill_id}
              name={skill.skill_name}
              tone={isOwned ? "positive" : "accent"}
              onRemove={() => handleRemove(skill.skill_id)}
            />
          ))}
        </div>
      )}

      <form className="inline-form" onSubmit={handleAdd}>
        <select
          className="input"
          value={selectedSkillId}
          onChange={(event) => setSelectedSkillId(event.target.value)}
          aria-label="Listeye yetenek ekle"
        >
          <option value="">Yetenek sec...</option>
          {selectableSkills.map((skill) => (
            <option key={skill.skill_id} value={skill.skill_id}>
              {skill.skill_name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn--primary btn--sm" disabled={!selectedSkillId}>
          Ekle
        </button>
      </form>

      {error && <ErrorMessage message={error} />}
    </Panel>
  );
}

export default SkillsPanel;

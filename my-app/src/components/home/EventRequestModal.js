import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import * as usersApi from "../../api/users.js";
import * as eventsApi from "../../api/events.js";
import { ErrorMessage, Loading } from "../ui/StateMessage.js";

const LABELS = {
  exchanges: { button: "Takas teklif et", title: "Takas teklifi", skillLabel: "Takas edecegim yetenek" },
  teaches: { button: "Ogretmeyi teklif et", title: "Ogretme teklifi", skillLabel: "Ogretecegim yetenek" },
};

/**
 * Etkinlik teklifi penceresi.
 *
 * Teklifte iki yetenek var:
 *   skill1 -> benim verecegim yetenek (asagidaki listeden seciyorum)
 *   skill2 -> karsi taraftan alacagim yetenek (aramada aradigim yetenek)
 *
 * Secim listesi rastgele degil: benim sahip oldugum yeteneklerden, karsi
 * tarafin ihtiyac listesinde de bulunanlar. Yani teklif ancak karsilikli
 * anlamliysa kurulabiliyor.
 */
function EventRequestModal({ type, loggedUser, targetUser, targetSkillId, targetNeeds, onCreated }) {
  const labels = LABELS[type];

  const [isOpen, setIsOpen] = useState(false);
  const [matchingSkills, setMatchingSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [form, setForm] = useState({ skillId: "", startDate: "", endDate: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleOpen() {
    setIsOpen(true);
    setError(null);
    setLoadingSkills(true);

    try {
      const mySkills = await usersApi.getSkills(loggedUser, "has");
      const neededIds = new Set(targetNeeds.map((skill) => skill.skill_id));

      setMatchingSkills(mySkills.filter((skill) => neededIds.has(skill.skill_id)));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingSkills(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setForm({ skillId: "", startDate: "", endDate: "" });
    setError(null);
  }

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // user1Id gonderilmiyor: teklifi baslatan taraf token'dan belirleniyor.
      await eventsApi.createEvent({
        skill1Id: Number(form.skillId),
        user2Id: targetUser,
        skill2Id: Number(targetSkillId),
        startDate: form.startDate,
        endDate: form.endDate,
        type,
      });

      handleClose();
      onCreated?.();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = form.skillId && form.startDate && form.endDate && !submitting;

  return (
    <>
      <button type="button" className="btn btn--outline btn--sm" onClick={handleOpen}>
        {labels.button}
      </button>

      <Modal show={isOpen} onHide={handleClose} centered contentClassName="app-modal">
        <Modal.Header closeButton>
          <Modal.Title>{labels.title}</Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body>
            {loadingSkills ? (
              <Loading label="Uygun yetenekler araniyor..." />
            ) : matchingSkills.length === 0 ? (
              <p className="state state--empty">
                {targetUser} kullanicisinin ihtiyac listesinde, senin sahip oldugun bir yetenek yok.
              </p>
            ) : (
              <>
                <label className="field">
                  <span className="field__label">{labels.skillLabel}</span>
                  <select
                    className="input"
                    value={form.skillId}
                    onChange={(event) => updateField("skillId", event.target.value)}
                    required
                  >
                    <option value="">Sec...</option>
                    {matchingSkills.map((skill) => (
                      <option key={skill.skill_id} value={skill.skill_id}>
                        {skill.skill_name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field-row">
                  <label className="field">
                    <span className="field__label">Baslangic</span>
                    <input
                      className="input"
                      type="date"
                      value={form.startDate}
                      onChange={(event) => updateField("startDate", event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">Bitis</span>
                    <input
                      className="input"
                      type="date"
                      // Bitis, baslangictan once secilemesin diye alt sinir.
                      min={form.startDate || undefined}
                      value={form.endDate}
                      onChange={(event) => updateField("endDate", event.target.value)}
                      required
                    />
                  </label>
                </div>
              </>
            )}

            {error && <ErrorMessage message={error} />}
          </Modal.Body>

          <Modal.Footer>
            <button type="button" className="btn btn--ghost" onClick={handleClose}>
              Vazgec
            </button>
            <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
              {submitting ? "Gonderiliyor..." : "Teklifi gonder"}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default EventRequestModal;

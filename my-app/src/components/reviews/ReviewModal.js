import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import StarRating from "../ui/StarRating.js";
import { ErrorMessage } from "../ui/StateMessage.js";
import * as reviewsApi from "../../api/reviews.js";

/**
 * Bitmis bir etkinlik icin degerlendirme yazma penceresi.
 *
 * Istek govdesinde "kimi degerlendiriyorum" bilgisi yok; sadece eventId
 * gonderiliyor. Karsi tarafi sunucu etkinlik kaydindan kendisi buluyor,
 * cunku istemciden gelen bir isme guvenmek, herkesin istedigi kisiye puan
 * yazabilmesi anlamina gelirdi.
 */
function ReviewModal({ pendingReview, onSubmitted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setIsOpen(false);
    setRating(0);
    setComment("");
    setError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // reviewerId gonderilmiyor: yorumu yazan taraf token'dan belirleniyor,
      // degerlendirilen kisi ise sunucuda etkinlik kaydindan bulunuyor.
      await reviewsApi.createReview({
        eventId: pendingReview.event_id,
        rating,
        comment,
      });

      handleClose();
      onSubmitted();
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn--primary btn--sm" onClick={() => setIsOpen(true)}>
        Degerlendir
      </button>

      <Modal show={isOpen} onHide={handleClose} centered contentClassName="app-modal">
        <Modal.Header closeButton>
          <Modal.Title>{pendingReview.counterpart_id} icin degerlendirme</Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <p className="review-modal__context">
              {pendingReview.type === "exchanges" ? "Takas" : "Ogretme"} etkinligi{" "}
              {pendingReview.end_date} tarihinde tamamlandi.
            </p>

            <div className="field">
              <span className="field__label">Puan</span>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <label className="field">
              <span className="field__label">Yorum (istege bagli)</span>
              <textarea
                className="input"
                rows={4}
                value={comment}
                maxLength={500}
                placeholder="Deneyimin nasildi?"
                onChange={(event) => setComment(event.target.value)}
              />
              <span className="field__hint">{comment.length}/500</span>
            </label>

            {error && <ErrorMessage message={error} />}
          </Modal.Body>

          <Modal.Footer>
            <button type="button" className="btn btn--ghost" onClick={handleClose}>
              Vazgec
            </button>
            {/* Puan zorunlu: yildiz secilmeden gonderilemiyor. */}
            <button type="submit" className="btn btn--primary" disabled={rating === 0 || submitting}>
              {submitting ? "Gonderiliyor..." : "Gonder"}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default ReviewModal;

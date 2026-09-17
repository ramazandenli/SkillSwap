import Panel from "../ui/Panel.js";
import Avatar from "../ui/Avatar.js";
import ReviewModal from "./ReviewModal.js";
import { AsyncBoundary, Empty } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as reviewsApi from "../../api/reviews.js";

/**
 * "Degerlendirmeni bekleyenler" listesi.
 *
 * Bir etkinligin burada gorunmesi icin uc kosul birden saglanmali:
 * kabul edilmis olmali, bitis tarihi gecmis olmali ve bu kullanici o
 * etkinlige daha once yorum yazmamis olmali. Uc kosul da SQL tarafindaki
 * get_pending_reviews fonksiyonunun icinde; arayuz sadece listeyi basiyor.
 */
function PendingReviewsPanel({ username, onReviewSubmitted }) {
  const { data, loading, error, reload } = useAsyncData(
    () => reviewsApi.getPendingReviews(),
    [username]
  );

  const pending = data ?? [];

  function handleSubmitted() {
    // Yorum yazilan etkinlik listeden dusmeli, profildeki ortalama puan da
    // degismis olabilir; ikisini birden tazeliyoruz.
    reload();
    onReviewSubmitted?.();
  }

  return (
    <Panel title="Degerlendirmeni bekleyenler" className="pending-reviews">
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {pending.length === 0 ? (
          <Empty>Bekleyen degerlendirme yok.</Empty>
        ) : (
          <ul className="user-list">
            {pending.map((item) => (
              <li key={item.event_id} className="user-list__item">
                <Avatar username={item.counterpart_id} size="sm" />
                <span className="user-list__name">{item.counterpart_id}</span>
                <span className="user-list__meta">{item.end_date} tarihinde bitti</span>
                <ReviewModal pendingReview={item} onSubmitted={handleSubmitted} />
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </Panel>
  );
}

export default PendingReviewsPanel;

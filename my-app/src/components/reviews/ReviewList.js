import Panel from "../ui/Panel.js";
import Avatar from "../ui/Avatar.js";
import StarRating from "../ui/StarRating.js";
import { AsyncBoundary, Empty } from "../ui/StateMessage.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import * as reviewsApi from "../../api/reviews.js";

/**
 * Kullaniciya yazilmis degerlendirmeler.
 *
 * Ortalama puan burada hesaplanmiyor: veritabanindaki user_rating view'i
 * zaten ortalamayi ve yorum sayisini veriyor. Ayni hesabi hem SQL'de hem
 * JavaScript'te tutmak, ikisinin zamanla ayrisma riski demek olurdu.
 */
function ReviewList({ username, refreshToken = 0 }) {
  const { data, loading, error, reload } = useAsyncData(
    () => reviewsApi.getReviewsForUser(username),
    [username, refreshToken]
  );

  const reviews = data?.reviews ?? [];

  return (
    <Panel
      title="Hakkimdaki degerlendirmeler"
      className="review-list"
      actions={
        data?.average_rating !== null && data?.average_rating !== undefined ? (
          <span className="review-list__average">
            <StarRating value={data.average_rating} size="sm" />
            {data.average_rating} / 5 &middot; {data.review_count} yorum
          </span>
        ) : null
      }
    >
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {reviews.length === 0 ? (
          <Empty>Henuz kimse seni degerlendirmemis.</Empty>
        ) : (
          <ul className="review-list__items">
            {reviews.map((review) => (
              <li key={review.review_id} className="review">
                <Avatar username={review.reviewer_id} size="sm" />
                <div className="review__body">
                  <div className="review__meta">
                    <span className="review__author">{review.reviewer_id}</span>
                    <StarRating value={review.rating} size="sm" />
                    <time className="review__date">
                      {new Date(review.created_at).toLocaleDateString("tr-TR")}
                    </time>
                  </div>
                  {review.comment && <p className="review__comment">{review.comment}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </Panel>
  );
}

export default ReviewList;

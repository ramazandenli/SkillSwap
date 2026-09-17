import client from "./client.js";

/** Bir kullaniciya yazilmis yorumlar + ortalama puan. */
export const getReviewsForUser = (userId) => client.get(`/reviews/user/${userId}`);

/** Kullanicinin yorum yazabilecegi, bitmis etkinlikler. Kimlik token'dan. */
export const getPendingReviews = () => client.get("/reviews/pending");

/** Yorumu yazan taraf token'dan; govdede reviewerId yok. */
export const createReview = ({ eventId, rating, comment }) =>
  client.post("/reviews", { eventId, rating, comment });

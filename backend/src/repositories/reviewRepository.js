import { query, queryOne } from "../config/db.js";

/** Bir kullaniciya yazilmis yorumlar. */
export function findForUser(userId) {
  return query("select * from get_user_reviews($1)", [userId]);
}

/**
 * Kullanicinin henuz yorum yazmadigi, bitmis etkinlikler.
 * "Bitmis" ve "daha once yazilmamis" kosullarinin ikisi de
 * get_pending_reviews fonksiyonunun icinde.
 */
export function findPendingForUser(userId) {
  return query("select * from get_pending_reviews($1)", [userId]);
}

export function findByEventAndReviewer(eventId, reviewerId) {
  return queryOne("select * from Reviews where event_id = $1 and reviewer_id = $2", [eventId, reviewerId]);
}

export function insert({ eventId, reviewerId, reviewedId, rating, comment }) {
  return queryOne(
    `insert into Reviews(event_id, reviewer_id, reviewed_id, rating, comment)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [eventId, reviewerId, reviewedId, rating, comment]
  );
}

/**
 * Ortalama puan user_rating view'inden geliyor.
 * Hic yorumu olmayan kullanici view'da yer almaz; o durumu controller
 * "henuz degerlendirilmemis" olarak yorumluyor.
 */
export function findRating(userId) {
  return queryOne("select * from user_rating where reviewed_id = $1", [userId]);
}

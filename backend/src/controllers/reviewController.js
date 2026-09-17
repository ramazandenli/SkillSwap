import * as reviewRepository from "../repositories/reviewRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, conflict, notFound } from "../utils/HttpError.js";
import { LIMITS, optionalText } from "../utils/validate.js";
import { toISODate } from "../utils/formatDate.js";

/** Bir kullaniciya yazilmis yorumlar + ortalama puani. */
export const getReviewsForUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [reviews, rating] = await Promise.all([
    reviewRepository.findForUser(id),
    reviewRepository.findRating(id),
  ]);

  res.json({
    reviews,
    average_rating: rating ? Number(rating.average_rating) : null,
    review_count: Number(rating?.review_count ?? 0),
  });
});

/**
 * Kullanicinin yorum yazabilecegi etkinlikler.
 * Uygunluk kosullari (kabul edilmis + bitis tarihi gecmis + daha once
 * yazilmamis) get_pending_reviews fonksiyonunun icinde.
 */
export const getPendingReviews = asyncHandler(async (req, res) => {
  const pending = await reviewRepository.findPendingForUser(req.user.username);

  res.json(
    pending.map((item) => ({
      ...item,
      end_date: toISODate(item.end_date),
    }))
  );
});

/**
 * Yorum yazma.
 *
 * Sunucu istemciden gelen hicbir kimlik bilgisine guvenmiyor:
 * yorumu yazan token'dan, degerlendirilen kisi ise etkinlik kaydindan
 * bulunuyor. Aksi halde bir kullanici istegi elle degistirip istedigi kisiye
 * istedigi puani yazabilirdi.
 */
export const createReview = asyncHandler(async (req, res) => {
  const reviewerId = req.user.username;
  const { eventId, rating, comment } = req.body;

  if (!eventId) throw badRequest("eventId zorunlu.");

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw badRequest("Puan 1 ile 5 arasinda bir tam sayi olmali.");
  }

  const event = await eventRepository.findById(eventId);
  if (!event) throw notFound("Etkinlik bulunamadi.");

  const isParticipant = event.user1_id === reviewerId || event.user2_id === reviewerId;
  if (!isParticipant) throw badRequest("Bu etkinligin tarafi degilsiniz.");

  if (event.status !== "accepted") {
    throw badRequest("Sadece kabul edilmis etkinlikler degerlendirilebilir.");
  }
  // get_pending_reviews ile ayni kural: etkinlik "bugunden once" bitmis olmali.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (new Date(event.end_date) >= todayStart) {
    throw badRequest("Etkinlik henuz bitmedi.");
  }

  const alreadyReviewed = await reviewRepository.findByEventAndReviewer(eventId, reviewerId);
  if (alreadyReviewed) throw conflict("Bu etkinlik icin zaten yorum yazdiniz.");

  const reviewedId = event.user1_id === reviewerId ? event.user2_id : event.user1_id;

  const review = await reviewRepository.insert({
    eventId,
    reviewerId,
    reviewedId,
    rating: numericRating,
    // Yorum metni "text" sutununda, yani veritabani tarafinda uzunluk siniri
    // yok. Sinir olmadan tek istekle megabaytlarca veri yazilabilirdi.
    comment: optionalText(comment, "Yorum", LIMITS.comment),
  });

  res.status(201).json(review);
});

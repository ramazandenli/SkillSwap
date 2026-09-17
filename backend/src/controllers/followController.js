import * as followRepository from "../repositories/followRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/HttpError.js";

/**
 * Takip eden taraf her zaman istegi atan kullanici. Eskiden bu alan istegin
 * govdesinden geliyordu, yani bir kullanici baskasi adina takip iliskisi
 * kurabilirdi.
 */
export const follow = asyncHandler(async (req, res) => {
  const follower = req.user.username;
  const { followed } = req.body;

  if (!followed) throw badRequest("followed zorunlu.");
  if (follower === followed) throw badRequest("Kullanici kendini takip edemez.");

  // Ayni satir ikinci kez eklenirse Follows tablosunun primary key'i buna
  // izin vermiyor; errorHandler o hatayi 409'a ceviriyor.
  await followRepository.follow(follower, followed);
  res.status(201).json({ message: "Takip edildi." });
});

/**
 * Takibi birakma iki yonlu calisiyor:
 *   direction="following" -> ben onu takip etmeyi birakiyorum
 *   direction="follower"  -> onu takipcilerimden cikariyorum
 * Her iki durumda da iliskinin bir ucu istegi atan kullanici; digerini
 * istemci bildiriyor.
 */
export const unfollow = asyncHandler(async (req, res) => {
  const { user, direction } = req.query;

  if (!user) throw badRequest("user zorunlu.");
  if (direction !== "following" && direction !== "follower") {
    throw badRequest("direction alani 'following' veya 'follower' olmali.");
  }

  const [follower, followed] =
    direction === "following" ? [req.user.username, user] : [user, req.user.username];

  await followRepository.unfollow(follower, followed);
  res.status(204).end();
});

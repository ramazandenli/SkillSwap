import * as userRepository from "../repositories/userRepository.js";
import * as followRepository from "../repositories/followRepository.js";
import * as reviewRepository from "../repositories/reviewRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound } from "../utils/HttpError.js";
import { formatDateFields } from "../utils/formatDate.js";

/** Sifreyi hicbir yanitta disari vermiyoruz. */
function toPublicProfile(user) {
  const { password, ...safe } = user;
  return formatDateFields(safe, ["birthdate"]);
}

export const listUsers = asyncHandler(async (req, res) => {
  res.json(await userRepository.listNonAdminUsers());
});

/** Profil kutusu: kisisel bilgiler + takip sayaclari + ortalama puan. */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) throw notFound("Kullanici bulunamadi.");

  const counts = await userRepository.findCounts(req.params.id);
  const rating = await reviewRepository.findRating(req.params.id);

  res.json({
    ...toPublicProfile(user),
    ...counts,
    average_rating: rating ? Number(rating.average_rating) : null,
    review_count: Number(rating?.review_count ?? 0),
  });
});

/**
 * Arama sonucu kartlari icin: profil + iki yetenek listesi tek istekte.
 * Eskiden istemci ayni kart icin ust uste uc istek atiyordu.
 */
export const getUserDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userRepository.findById(id);
  if (!user) throw notFound("Kullanici bulunamadi.");

  // Uc sorgu birbirine bagli degil, bu yuzden sirayla degil paralel calisiyor.
  const [hasSkills, needSkills, rating] = await Promise.all([
    userRepository.findSkillsOwned(id),
    userRepository.findSkillsNeeded(id),
    reviewRepository.findRating(id),
  ]);

  res.json({
    profile: toPublicProfile(user),
    hasSkills,
    needSkills,
    average_rating: rating ? Number(rating.average_rating) : null,
    review_count: Number(rating?.review_count ?? 0),
  });
});

export const getCounts = asyncHandler(async (req, res) => {
  res.json(await userRepository.findCounts(req.params.id));
});

export const getFollowers = asyncHandler(async (req, res) => {
  res.json(await followRepository.findFollowers(req.params.id));
});

export const getFollowings = asyncHandler(async (req, res) => {
  res.json(await followRepository.findFollowings(req.params.id));
});

/**
 * GET /api/users/:id/skills?type=has|needs
 * Tek endpoint iki listeyi de veriyor; eskiden /user/has/:id ve
 * /user/needs/:id diye ayni sorgunun iki kopyasi vardi.
 */
export const getSkills = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (!userRepository.isValidSkillType(type)) {
    throw badRequest("type alani 'has' veya 'needs' olmali.");
  }

  const skills =
    type === "has"
      ? await userRepository.findSkillsOwned(req.params.id)
      : await userRepository.findSkillsNeeded(req.params.id);

  res.json(skills);
});

export const addSkill = asyncHandler(async (req, res) => {
  const { skillId, type } = req.body;

  if (!userRepository.isValidSkillType(type)) {
    throw badRequest("type alani 'has' veya 'needs' olmali.");
  }
  if (!skillId) throw badRequest("skillId zorunlu.");

  await userRepository.addSkill(req.params.id, skillId, type);
  res.status(201).json({ message: "Yetenek eklendi." });
});

export const removeSkill = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (!userRepository.isValidSkillType(type)) {
    throw badRequest("type alani 'has' veya 'needs' olmali.");
  }

  await userRepository.removeSkill(req.params.id, req.params.skillId, type);
  res.status(204).end();
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userRepository.deleteUser(req.params.id);
  res.status(204).end();
});

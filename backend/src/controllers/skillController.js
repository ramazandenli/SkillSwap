import * as skillRepository from "../repositories/skillRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/HttpError.js";

export const listSkills = asyncHandler(async (req, res) => {
  res.json(await skillRepository.listAll());
});

export const createSkill = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) throw badRequest("Yetenek adi bos olamaz.");

  res.status(201).json(await skillRepository.create(name));
});

export const deleteSkill = asyncHandler(async (req, res) => {
  await skillRepository.remove(req.params.id);
  res.status(204).end();
});

/**
 * GET /api/search?skillId=&sort=points|count
 *
 * Eslesme mantigi tamamen SQL fonksiyonunda; burada sadece parametreleri
 * dogruluyoruz. sort bilinmeyen bir deger gelirse repository varsayilan
 * olarak puana gore siralamaya dusuyor.
 *
 * "Kimin icin arama yapiliyor" bilgisi artik sorgu parametresinden degil
 * token'dan geliyor: eslesme, arayan kisinin sahip oldugu yeteneklere gore
 * hesaplandigi icin bu alan baskasinin adiyla doldurulabilseydi kullanici
 * baskasinin eslesme listesini gorebilirdi.
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { skillId, sort } = req.query;

  if (!skillId) {
    throw badRequest("skillId zorunlu.");
  }

  res.json(await skillRepository.search({ userId: req.user.username, skillId, sort }));
});

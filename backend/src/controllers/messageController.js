import * as messageRepository from "../repositories/messageRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/HttpError.js";

/**
 * Sohbet gecmisi. Canli mesajlasma Socket.IO uzerinden yuruyor ama sayfa
 * ilk acildiginda gecmisi bir kere HTTP ile cekmek gerekiyor: socket sadece
 * baglandiktan sonrasini duyar, oncesini bilmez.
 *
 * Konusmanin bir ucu her zaman istegi atan kullanici. Eskiden her iki uc da
 * sorgu parametresiydi (?user1=&user2=), yani adres cubuguna baskalarinin
 * adini yazan biri onlarin yazismalarini okuyabilirdi.
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { peer } = req.query;
  if (!peer) throw badRequest("peer zorunlu.");

  res.json(await messageRepository.findConversation(req.user.username, peer));
});

/** Kullanicinin yazistigi kisiler. Her zaman kendi listesi. */
export const getContacts = asyncHandler(async (req, res) => {
  res.json(await messageRepository.findContacts(req.user.username));
});

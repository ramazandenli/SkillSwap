import * as eventRepository from "../repositories/eventRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/HttpError.js";
import { toISODate } from "../utils/formatDate.js";

const EVENT_TYPES = ["exchanges", "teaches"];

/**
 * Bir etkinlik veritabaninda simetrik duruyor: user1 / user2, skill1 / skill2.
 * Ekranda ise her zaman "ben ve karsi taraf" seklinde gosteriliyor.
 *
 * Bu donusumu tek yerde yapiyoruz. Eskiden istemci tarafinda ayni JSX blogu
 * "ben user1 miyim yoksa user2 mi" diye iki kez kopyalanmisti (once exchange
 * icin, sonra teach icin: toplam dort kopya).
 */
function toViewerPerspective(event, viewerId) {
  const isInitiator = event.user1_id === viewerId;

  return {
    event_id: event.event_id,
    type: event.type,
    status: event.status,
    start_date: toISODate(event.start_date),
    end_date: toISODate(event.end_date),
    counterpart_id: isInitiator ? event.user2_id : event.user1_id,
    skill_given: isInitiator ? event.skill1_name : event.skill2_name,
    skill_taken: isInitiator ? event.skill2_name : event.skill1_name,
    // Istegi karsi taraf baslattiysa cevaplama hakki bizde.
    can_respond: event.status === "waiting" && event.user2_id === viewerId,
  };
}

/**
 * Etkinlikler iki listede donuyor: takas (exchanges) ve ogretme (teaches).
 * Ayirma islemi eskiden for dongusu + iki push ile yapiliyordu; filter
 * ayni isi tek satirda ve niyeti okunur sekilde yapiyor.
 */
export const getEventsForUser = asyncHandler(async (req, res) => {
  const viewerId = req.params.id;
  const events = (await eventRepository.findByUser(viewerId)).map((event) =>
    toViewerPerspective(event, viewerId)
  );

  res.json({
    exchanges: events.filter((event) => event.type === "exchanges"),
    teaches: events.filter((event) => event.type === "teaches"),
  });
});

/**
 * Teklifi baslatan taraf (user1) her zaman istegi atan kullanici; govdeden
 * gelmiyor. Aksi halde bir kullanici baskasi adina etkinlik teklifi
 * olusturabilirdi.
 */
export const createEvent = asyncHandler(async (req, res) => {
  const user1Id = req.user.username;
  const { skill1Id, user2Id, skill2Id, startDate, endDate, type } = req.body;

  if (!user2Id || !skill1Id || !skill2Id || !startDate || !endDate) {
    throw badRequest("Tum alanlar zorunlu.");
  }
  if (!EVENT_TYPES.includes(type)) {
    throw badRequest("type alani 'exchanges' veya 'teaches' olmali.");
  }
  if (user1Id === user2Id) {
    throw badRequest("Kullanici kendisiyle etkinlik olusturamaz.");
  }
  if (new Date(endDate) < new Date(startDate)) {
    throw badRequest("Bitis tarihi baslangictan once olamaz.");
  }

  const event = await eventRepository.create({
    user1Id,
    skill1Id,
    user2Id,
    skill2Id,
    startDate,
    endDate,
    type,
  });

  res.status(201).json(event);
});

/**
 * Kabul etme.
 *
 * Yalnizca teklifin GONDERILDIGI taraf (user2) kabul edebilir. Bu kontrol
 * onemli: kabul islemi veritabanindaki trigger araciligiyla iki tarafa da
 * 10 puan ekliyor, yani kontrolsuz birakilsa herkes kendi teklifini kabul
 * edip puan uretebilirdi.
 */
export const acceptEvent = asyncHandler(async (req, res) => {
  const event = await eventRepository.findById(req.params.id);
  if (!event) throw notFound("Etkinlik bulunamadi.");

  if (event.user2_id !== req.user.username) {
    throw forbidden("Bu teklifi yalnizca gonderildigi kisi kabul edebilir.");
  }
  if (event.status !== "waiting") {
    throw badRequest("Bu etkinlik zaten kabul edilmis.");
  }

  res.json(await eventRepository.accept(req.params.id));
});

/**
 * Reddetme / iptal. Iki taraf da yapabilir: teklifi gonderen vazgecebilir,
 * alan reddedebilir. Ucuncu bir kisi silemez.
 */
export const rejectEvent = asyncHandler(async (req, res) => {
  const event = await eventRepository.findById(req.params.id);
  if (!event) throw notFound("Etkinlik bulunamadi.");

  const isParticipant =
    event.user1_id === req.user.username || event.user2_id === req.user.username;

  if (!isParticipant) {
    throw forbidden("Bu etkinligin tarafi degilsiniz.");
  }

  await eventRepository.remove(req.params.id);
  res.status(204).end();
});

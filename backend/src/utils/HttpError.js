/**
 * Beklenen hatalari (400 / 404 / 409) beklenmeyenlerden (500) ayirmak icin.
 *
 * Controller "bu kullanici yok" demek istediginde throw new HttpError(404, ...)
 * yaziyor; errorHandler bu tipi taniyip mesaji oldugu gibi istemciye veriyor.
 * Taninmayan hatalarda ise mesaji gizleyip genel bir 500 donuyor.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFound = (message) => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
export const unauthorized = (message) => new HttpError(401, message);

/**
 * 401 ile 403 farki:
 *   401 = kim oldugunu bilmiyoruz (token yok, gecersiz veya suresi dolmus)
 *   403 = kim oldugunu biliyoruz ama bu isleme yetkin yok
 * Istemci bu ayrima gore davraniyor: 401'de oturumu kapatip giris ekranina
 * atiyor, 403'te sadece hata mesajini gosteriyor.
 */
export const forbidden = (message) => new HttpError(403, message);

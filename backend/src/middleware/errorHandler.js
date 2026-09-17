import { HttpError } from "../utils/HttpError.js";

/** Postgres'in bize bir sey anlatan hata kodlari. */
const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_CHECK_VIOLATION = "23514";
const PG_STRING_TOO_LONG = "22001";
const PG_INVALID_DATETIME = "22007";
const PG_INVALID_TEXT_REPRESENTATION = "22P02";

/**
 * Rotalarin hicbiriyle eslesmeyen istekler icin.
 * Bunu koymazsak Express kendi HTML hata sayfasini donuyor ve
 * fetch eden istemci JSON bekledigi icin parse hatasi aliyor.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Rota bulunamadi: ${req.method} ${req.originalUrl}` });
}

/**
 * Tum hatalarin toplandigi tek nokta.
 *
 * Dort argumanli olmasi zorunlu: Express bir middleware'i hata middleware'i
 * olarak ancak imzasi (err, req, res, next) ise tanir. `next` kullanilmasa
 * bile silinemez.
 */
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error?.code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({ message: "Bu kayit zaten mevcut." });
  }

  if (error?.code === PG_FOREIGN_KEY_VIOLATION) {
    return res.status(400).json({ message: "Baglantili kayit bulunamadi." });
  }

  if (error?.code === PG_CHECK_VIOLATION) {
    return res.status(400).json({ message: "Gonderilen deger kurallara uymuyor." });
  }

  /*
   * Asagidaki uc kod da "istemci gecersiz veri gonderdi" anlamina geliyor:
   * sutuna sigmayan metin, gecersiz tarih, sayi beklenen yerde harf.
   * Bunlar sunucu hatasi degil istemci hatasi; 500 donmek hem yaniltici
   * olur hem de gercek sunucu hatalarini loglarda gozden kacirtir.
   *
   * Guvenlik agi olarak duruyorlar: normalde utils/validate.js bu degerleri
   * veritabanina hic ulastirmiyor.
   */
  if (
    error?.code === PG_STRING_TOO_LONG ||
    error?.code === PG_INVALID_DATETIME ||
    error?.code === PG_INVALID_TEXT_REPRESENTATION
  ) {
    return res.status(400).json({ message: "Gonderilen veri gecerli bicimde degil." });
  }

  // Buraya dusen her sey beklenmeyen bir hata: loga tam halini yaziyoruz ama
  // istemciye ayrintiyi vermiyoruz.
  console.error("Beklenmeyen hata:", error);
  res.status(500).json({ message: "Sunucuda beklenmeyen bir hata olustu." });
}

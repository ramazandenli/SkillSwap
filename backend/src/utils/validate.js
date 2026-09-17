import { badRequest } from "./HttpError.js";

/**
 * Sunucu tarafi girdi dogrulama.
 *
 * Neden gerekli: tarayicidaki `minLength` / `maxLength` nitelikleri yalnizca
 * formu dolduran kullaniciyi yonlendirir. API'ye dogrudan istek atan biri
 * onlari hic gormez. Sinir koymazsak iki sorun cikiyor:
 *
 *   1. Veritabani sutun sinirini asan degerler Postgres hatasina (22001)
 *      dusup 500 doner - yani gecersiz girdi "sunucu hatasi" gibi gorunur.
 *   2. Metin (text) sutunlarinda sinir olmadigi icin tek istekle megabaytlarca
 *      veri yazilabilir.
 *
 * Bu yuzden her sinir, veritabanindaki sutun tanimiyla ayni yerde tutuluyor.
 */

/** database.sql icindeki sutun tanimlariyla eslesen sinirlar. */
export const LIMITS = {
  username: { min: 6, max: 30 },
  password: { min: 8, max: 72 }, // bcrypt 72 bayttan sonrasini yok sayar
  name: { min: 1, max: 30 },
  surname: { min: 1, max: 30 },
  message: { min: 1, max: 2000 },
  comment: { max: 500 },
};

/**
 * Zorunlu metin alani: bosluklari kirpar, uzunlugu dogrular.
 *
 * @param {unknown} value
 * @param {string} field hata mesajinda gorunecek alan adi
 * @param {{min?: number, max: number}} limit
 * @returns {string} kirpilmis deger
 */
export function requireText(value, field, limit) {
  if (typeof value !== "string") {
    throw badRequest(`${field} alani zorunlu.`);
  }

  const trimmed = value.trim();
  const min = limit.min ?? 1;

  if (trimmed.length < min) {
    throw badRequest(`${field} en az ${min} karakter olmali.`);
  }
  if (trimmed.length > limit.max) {
    throw badRequest(`${field} en fazla ${limit.max} karakter olabilir.`);
  }

  return trimmed;
}

/**
 * Istege bagli metin alani. Bos gelirse null doner (veritabaninda da null durur).
 */
export function optionalText(value, field, limit) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requireText(value, field, { min: 1, max: limit.max });
}

/**
 * Sabit bir secenek listesinden deger.
 * Nesne anahtari araminda `in` yerine dizi kullaniyoruz ki prototip
 * zincirindeki anahtarlar (toString, constructor ...) gecerli sayilmasin.
 */
export function requireOneOf(value, field, allowed) {
  if (!allowed.includes(value)) {
    throw badRequest(`${field} alani su degerlerden biri olmali: ${allowed.join(", ")}`);
  }

  return value;
}

/**
 * YYYY-MM-DD bicimli, gercekten var olan bir tarih.
 *
 * Sadece Date'e cevirip kontrol etmek yetmiyor: "2024-02-31" gibi degerler
 * bazi ortamlarda sessizce kayabiliyor. Bu yuzden once bicimi, sonra
 * gecerliligi kontrol ediyoruz.
 */
export function requireDate(value, field) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw badRequest(`${field} alani YYYY-AA-GG biciminde olmali.`);
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime()) || !date.toISOString().startsWith(value)) {
    throw badRequest(`${field} gecerli bir tarih degil.`);
  }

  return value;
}

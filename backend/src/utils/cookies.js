import { env } from "../config/env.js";

/** Token'i tasiyan cerezin adi. Tek yerde tanimli. */
export const AUTH_COOKIE = "skillswap_token";

/**
 * Cerez secenekleri.
 *
 * httpOnly: JavaScript bu cereze erisemez. Asil kazanc bu — token artik
 *   localStorage'da degil, yani sayfaya sizan bir XSS betigi token'i
 *   okuyup disari kacirabilecek durumda degil.
 *
 * sameSite "lax": tarayici, baska bir siteden tetiklenen POST/DELETE
 *   isteklerine bu cerezi EKLEMIYOR. CSRF'e karsi ilk savunma bu.
 *   ("strict" daha siki olurdu ama disaridan gelen normal linkleri de
 *   oturumsuz acardi.)
 *
 * secure: cerez yalnizca HTTPS uzerinden gonderilir. Gelistirmede
 *   http://localhost kullanildigi icin kapali; acik olsaydi tarayici
 *   cerezi hic gondermez ve giris calismazdi.
 *
 * maxAge: token'in gecerlilik suresiyle ayni tutuluyor ki tarayicida
 *   suresi coktan dolmus bir token beklemesin.
 */
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    maxAge: env.jwt.maxAgeMs,
    path: "/",
  };
}

/**
 * "Cookie" basligindaki ham metni nesneye cevirir.
 *
 * Neden hazir bir paket (cookie-parser) kullanmiyoruz: cerezi iki yerde
 * okumamiz gerekiyor — Express istegi ve Socket.IO el sikismasi. Socket.IO
 * tarafinda Express middleware'i calismiyor, elimizde yalnizca ham baslik
 * metni oluyor. Tek bir kucuk ayristirici ikisini de besliyor.
 *
 * @param {string|undefined} header  "a=1; b=2" bicimindeki baslik
 * @returns {Record<string,string>}
 */
export function parseCookies(header) {
  const cookies = {};

  if (typeof header !== "string" || !header) {
    return cookies;
  }

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (!name) continue;

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      // Bozuk yuzde kodlamasi varsa ham degeri birakiyoruz; bu deger zaten
      // token dogrulamasindan gecemezse istek 401 doner.
      cookies[name] = value;
    }
  }

  return cookies;
}

/** Bir istekten (veya soket el sikismasindan) token'i okur. */
export function readAuthCookie(cookieHeader) {
  return parseCookies(cookieHeader)[AUTH_COOKIE] ?? null;
}

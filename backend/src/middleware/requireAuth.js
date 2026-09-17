import { verifyToken } from "../utils/jwt.js";
import { readAuthCookie } from "../utils/cookies.js";
import { forbidden, unauthorized } from "../utils/HttpError.js";

/**
 * Kimlik dogrulama.
 *
 * Buradan sonraki her katman "istegi kim atti" sorusunun cevabini
 * `req.user` uzerinden alir. Kritik nokta: bu bilgi istegin govdesinden,
 * sorgu parametresinden veya adresinden DEGIL, imzali token'dan geliyor.
 * Istemci token'in icerigini degistirirse imza tutmaz ve istek 401 doner.
 *
 * Token httpOnly bir cerezde tasiniyor. Istemci tarafinda hicbir JavaScript
 * bu cerezi okuyamaz; tarayici onu ayni siteye giden isteklere kendisi
 * ekler. Bu yuzden burada `Authorization` basligina bakmiyoruz.
 */
export function requireAuth(req, res, next) {
  const token = readAuthCookie(req.headers.cookie);

  if (!token) {
    throw unauthorized("Bu islem icin giris yapmalisiniz.");
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    // jsonwebtoken suresi dolmus, imzasi bozuk ve bicimi hatali token'lari
    // farkli hata tipleriyle bildiriyor. Istemci acisindan uculu de ayni
    // anlama geliyor: bu token ise yaramaz, yeniden giris yap.
    throw unauthorized("Oturumunuz gecersiz veya suresi dolmus.");
  }
}

/**
 * Yetkilendirme: adresteki kullanici, istegi atan kullanici mi?
 *
 * Ornegin GET /api/events/user/:id rotasinda `:id` baskasinin kullanici adi
 * olabilir. requireAuth bunu yakalamaz — istek gecerli bir oturum tasiyor,
 * sadece baska birinin verisini istiyor. Ayrimi burasi yapiyor.
 *
 * Admin bilerek muaf tutulmuyor: yonetici olmak baskasinin ozel
 * yazismalarini okuma hakki vermiyor.
 */
export function requireSelf(req, res, next) {
  if (req.params.id !== req.user.username) {
    throw forbidden("Yalnizca kendi verinize erisebilirsiniz.");
  }

  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.type !== "admin") {
    throw forbidden("Bu islem icin yonetici yetkisi gerekiyor.");
  }

  next();
}

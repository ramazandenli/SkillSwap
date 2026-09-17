import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * JWT uretme ve dogrulama.
 *
 * Token uc parcadan olusur: header.payload.signature. Ilk iki parca yalnizca
 * base64 ile kodlanmistir, sifreli degildir — yani icerigi herkes okuyabilir.
 * Guvenligi saglayan sey ucuncu parca: sunucunun gizli anahtariyla uretilen
 * imza. Icerik degistirilirse imza tutmaz.
 *
 * Bu yuzden payload'a asla sifre veya gizli bilgi konmuyor; sadece "bu token
 * kime ait" ve "hangi rolde" bilgisi var.
 */

/**
 * @param {{ username: string, type: string }} user
 * @returns {string} imzali token
 */
export function signToken(user) {
  return jwt.sign(
    // sub (subject) JWT standardinda "token kimi temsil ediyor" alani.
    { sub: user.username, type: user.type },
    env.jwt.secret,
    { algorithm: "HS256", expiresIn: env.jwt.expiresIn }
  );
}

/**
 * Imzayi ve son kullanma tarihini dogrular.
 * Gecersiz veya suresi dolmus token'da hata firlatir.
 *
 * @param {string} token
 * @returns {{ username: string, type: string }}
 */
export function verifyToken(token) {
  // algorithms bilerek pinleniyor: dogrulayiciya "hangi algoritma gecerli"
  // demezsek, token'in kendi header'indaki alg degerine guvenmis oluruz.
  // Kutuphane alg:"none" durumunu zaten reddediyor ama algoritmayi acikca
  // sabitlemek, imzalama tarafi degistiginde dogrulamanin sessizce
  // genislemesini de onluyor.
  const payload = jwt.verify(token, env.jwt.secret, { algorithms: ["HS256"] });

  return { username: payload.sub, type: payload.type };
}

/**
 * "Authorization: Bearer <token>" basligindan token'i ayiklar.
 * Baslik yoksa veya bicimi yanlissa null doner.
 *
 * @param {string|undefined} header
 * @returns {string|null}
 */
export function extractBearerToken(header) {
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();

  return token || null;
}

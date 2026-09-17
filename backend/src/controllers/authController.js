import bcrypt from "bcrypt";
import * as userRepository from "../repositories/userRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { AUTH_COOKIE, authCookieOptions } from "../utils/cookies.js";
import {
  LIMITS,
  requireDate,
  requireOneOf,
  requireText,
} from "../utils/validate.js";
import { badRequest, conflict, unauthorized } from "../utils/HttpError.js";

const SALT_ROUNDS = 10;

/**
 * Gecersiz kullanici adi denemelerinde bcrypt.compare'in harcadigi sureyi
 * taklit etmek icin kullanilan sahte hash. Asagida sebebi anlatiliyor.
 * Karsiligi olan duz metin onemsiz; kimse bu hesapla giris yapamaz.
 */
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.aAPuBqmpTFOXWfrqxrjJvHOhFPQi";

/**
 * Kayit.
 *
 * Sifre asla duz metin olarak saklanmiyor: bcrypt.hash her cagrildiginda
 * rastgele bir salt uretip onu hash'in icine gomuyor. Bu yuzden ayni sifreye
 * sahip iki kullanicinin veritabanindaki hash'i bile farkli oluyor.
 *
 * Alanlar sunucuda da dogrulaniyor. Formdaki minLength/maxLength yalnizca
 * tarayiciyi baglar; API'ye dogrudan istek atan biri onlari gormez ve
 * sutun sinirini asan bir deger dogrudan veritabani hatasina duserdi.
 */
export const signup = asyncHandler(async (req, res) => {
  const username = requireText(req.body.username, "Kullanici adi", LIMITS.username);
  const password = requireText(req.body.password, "Sifre", LIMITS.password);
  const name = requireText(req.body.name, "Ad", LIMITS.name);
  const surname = requireText(req.body.surname, "Soyad", LIMITS.surname);
  const gender = requireOneOf(req.body.gender, "Cinsiyet", ["M", "F"]);
  const birthdate = requireDate(req.body.date, "Dogum tarihi");

  const existing = await userRepository.findById(username);
  if (existing) {
    throw conflict("Bu kullanici adi zaten alinmis.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await userRepository.insertUser({
    userId: username,
    name,
    surname,
    gender,
    birthdate,
    points: 0,
    // Rol istemciden alinmiyor: govdeye type:"admin" yazarak yonetici
    // olunamasin diye burada sabit.
    passwordHash,
    type: "user",
  });

  const session = { username, type: "user" };

  // Kayit olan kullanici ayrica giris yapmak zorunda kalmasin.
  issueSession(res, session);
  res.status(201).json(session);
});

/**
 * Giris.
 *
 * Kullanici yoksa da sifre yanlissa da ayni mesaji donuyoruz. Farkli mesaj
 * vermek, saldirgana "bu kullanici adi sistemde var" bilgisini bedava
 * verirdi (kullanici adi sayimi / user enumeration).
 *
 * Mesaji ayni yapmak tek basina yetmiyor: kullanici bulunamayinca hemen
 * donseydik, o istek bcrypt hesabini hic yapmadigi icin gozle gorulur
 * sekilde daha hizli cevaplanirdi. Sureyi olcen biri, mesajlar ayni olsa
 * bile hangi kullanici adlarinin var oldugunu anlayabilirdi. Bu yuzden
 * kullanici yoksa sahte bir hash ile ayni hesabi yine de yapiyoruz.
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    throw badRequest("Kullanici adi ve sifre zorunlu.");
  }

  const account = await userRepository.findCredentials(username);

  const passwordMatches = await bcrypt.compare(password, account?.password ?? DUMMY_HASH);

  if (!account || !passwordMatches) {
    throw unauthorized("Kullanici adi veya sifre hatali.");
  }

  const session = { username: account.user_id, type: account.type };

  issueSession(res, session);
  res.json(session);
});

/**
 * Token'i httpOnly cerez olarak yaziyor.
 *
 * Token yanit govdesinde DONMUYOR. Donseydi istemcinin onu bir yere
 * saklamasi gerekirdi ve httpOnly cerezin butun anlami kaybolurdu.
 * Istemci token'i hic gormuyor; sadece "kim oldugunu" ogreniyor.
 */
function issueSession(res, session) {
  res.cookie(AUTH_COOKIE, signToken(session), authCookieOptions());
}

/**
 * Cikis.
 *
 * Cerezi silmek icin ayni secenekleri vermek zorundayiz: tarayici bir cerezi
 * ancak adi, yolu ve sameSite/secure ozellikleri eslesirse siler. maxAge
 * disaridayken clearCookie bunu kendisi hallediyor.
 *
 * Not: bu islem token'i sunucu tarafinda gecersiz kilmiyor. JWT durumsuzdur;
 * cikis, cerezi tarayicidan silmekten ibaret.
 */
export const logout = asyncHandler(async (req, res) => {
  const { maxAge, ...options } = authCookieOptions();

  res.clearCookie(AUTH_COOKIE, options);
  res.status(204).end();
});

/**
 * Acilista "ben kimim" sorusu.
 *
 * Token httpOnly cerezde oldugu icin istemci onu okuyup icindeki kullanici
 * adini cikaramiyor. Bu yuzden sayfa her yuklendiginde oturumu sunucuya
 * soruyor. Cerez yoksa veya suresi dolmussa requireAuth zaten 401 doner ve
 * istemci kullaniciyi giris ekraninda birakir.
 */
export const me = asyncHandler(async (req, res) => {
  res.json({ username: req.user.username, type: req.user.type });
});

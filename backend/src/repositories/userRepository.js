import { query, queryOne } from "../config/db.js";

/**
 * Kullanici tablosuna ve ona bagli SQL fonksiyonlarina erisen tek katman.
 * Controller'lar burayi cagirir, dogrudan SQL yazmaz.
 */

export function findById(userId) {
  return queryOne("select * from Users where user_id = $1", [userId]);
}

export function findCredentials(userId) {
  return queryOne("select user_id, password, type from Users where user_id = $1", [userId]);
}

export function listNonAdminUsers() {
  return query("select user_id from Users where type <> $1 order by user_id", ["admin"]);
}

/**
 * insert_user, database.sql icinde tanimli bir stored procedure.
 * Ayni kullanici adi ikinci kez gelirse primary key ihlali firlatir;
 * onu errorHandler 409'a ceviriyor.
 */
export function insertUser({ userId, name, surname, gender, birthdate, points, passwordHash, type }) {
  return query("call insert_user($1, $2, $3, $4, $5, $6, $7, $8)", [
    userId,
    name,
    surname,
    gender,
    birthdate,
    points,
    passwordHash,
    type,
  ]);
}

export function deleteUser(userId) {
  return query("delete from Users where user_id = $1", [userId]);
}

/* --- yetenekler --- */

export function findSkillsOwned(userId) {
  return query("select * from get_user_skills($1)", [userId]);
}

export function findSkillsNeeded(userId) {
  return query("select * from get_user_skills_needs($1)", [userId]);
}

/**
 * "has" ve "needs" ayni sekle sahip iki tablo. Tablo adini disaridan
 * gelen metinle birlestirmiyoruz; sabit bir esleme uzerinden seciyoruz ki
 * SQL injection yuzeyi olusmasin.
 */
const SKILL_TABLES = { has: "Has", needs: "Needs" };

export function addSkill(userId, skillId, type) {
  const table = SKILL_TABLES[type];
  return query(`insert into ${table}(user_id, skill_id) values ($1, $2)`, [userId, skillId]);
}

export function removeSkill(userId, skillId, type) {
  const table = SKILL_TABLES[type];
  return query(`delete from ${table} where user_id = $1 and skill_id = $2`, [userId, skillId]);
}

/**
 * DIKKAT: burada `type in SKILL_TABLES` yazmak hataliydi.
 *
 * `in` operatoru prototip zincirine de bakiyor, yani "toString",
 * "constructor", "__proto__" gibi degerler de gecerli sayiliyordu. O durumda
 * SKILL_TABLES[type] bir tablo adi yerine bir fonksiyon donuyor ve yukaridaki
 * sablon "insert into function toString() { [native code] }(...)" gibi bozuk
 * bir SQL uretiyordu.
 *
 * Enjeksiyon degil (metin saldirganin kontrolunde degil) ama istekle
 * tetiklenebilen bir 500. Object.hasOwn yalnizca nesnenin kendi anahtarlarina
 * bakiyor.
 */
export function isValidSkillType(type) {
  return Object.hasOwn(SKILL_TABLES, type);
}

/* --- sayaclar --- */

/**
 * follower_count ve following_count birer view.
 * Hic takipcisi olmayan kullanici bu view'larda hic satir olarak gecmez,
 * bu yuzden satir yoksa 0 donuyoruz.
 */
export async function findCounts(userId) {
  const followers = await queryOne("select count from follower_count where followed_id = $1", [userId]);
  const followings = await queryOne("select count from following_count where follower_id = $1", [userId]);

  return {
    followers_count: Number(followers?.count ?? 0),
    followings_count: Number(followings?.count ?? 0),
  };
}

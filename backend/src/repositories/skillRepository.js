import { query, queryOne } from "../config/db.js";

export function listAll() {
  return query("select * from Skills order by skill_name");
}

export function create(skillName) {
  return queryOne("insert into Skills(skill_name) values ($1) returning *", [skillName]);
}

export function remove(skillId) {
  return query("delete from Skills where skill_id = $1", [skillId]);
}

/**
 * Arama, iki farkli SQL fonksiyonundan birine dusuyor:
 *
 *   getSearchResultsByPoints -> eslesen kullanicilar puana gore
 *   getSearchResultsByCount  -> eslesen kullanicilar ortak ihtiyac sayisina gore
 *
 * Ikisi de ayni mantigi kuruyor: "aradigim yetenege sahip olan VE benim
 * sahip oldugum bir yetenege ihtiyaci olan" kullanicilar. Yani eslesme
 * kurali uygulamada degil veritabaninda duruyor.
 */
export function search({ userId, skillId, sort }) {
  const fn = sort === "count" ? "getSearchResultsByCount" : "getSearchResultsByPoints";
  return query(`select * from ${fn}($1, $2)`, [userId, skillId]);
}

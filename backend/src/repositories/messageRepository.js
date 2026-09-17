import { query, queryOne } from "../config/db.js";

/**
 * Iki kullanici arasindaki tum mesajlar, eskiden yeniye.
 * OR'un iki tarafi da gerekli cunku konusma cift yonlu:
 * ya ben ona yazmisim ya o bana.
 */
export function findConversation(user1, user2) {
  return query(
    `select * from Texts
     where (from_id = $1 and to_id = $2)
        or (from_id = $2 and to_id = $1)
     order by date asc`,
    [user1, user2]
  );
}

/**
 * Kaydedilen satiri geri donduruyoruz (returning *): mesajin gercek
 * text_id ve date degerleri veritabaninda olusuyor, Socket.IO da bu satiri
 * oldugu gibi iki tarafa yayinliyor. Boylece iki istemci ayni veriyi goruyor.
 */
export function insert({ fromId, toId, message }) {
  return queryOne(
    "insert into Texts(from_id, to_id, message) values ($1, $2, $3) returning *",
    [fromId, toId, message]
  );
}

/** get_contacted_users: kullanicinin yazistigi herkesi UNION ile tekillestirir. */
export function findContacts(userId) {
  return query("select * from get_contacted_users($1)", [userId]);
}

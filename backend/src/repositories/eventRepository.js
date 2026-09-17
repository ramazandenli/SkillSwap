import { query, queryOne } from "../config/db.js";

/**
 * get_events kullanicinin taraf oldugu etkinlikleri donuyor ama sadece
 * skill_id'leri veriyor. Yetenek adlarini istemcide aramak yerine burada
 * join ediyoruz: bir SQL tablo fonksiyonunun ciktisi normal bir tablo gibi
 * FROM icinde kullanilabiliyor.
 */
export function findByUser(userId) {
  return query(
    `select c.*, s1.skill_name as skill1_name, s2.skill_name as skill2_name
     from get_events($1) c
     join Skills s1 on s1.skill_id = c.skill1_id
     join Skills s2 on s2.skill_id = c.skill2_id
     order by c.start_date desc`,
    [userId]
  );
}

export function findById(eventId) {
  return queryOne("select * from Collaborates_with where event_id = $1", [eventId]);
}

export function create({ user1Id, skill1Id, user2Id, skill2Id, startDate, endDate, type }) {
  return queryOne(
    `insert into Collaborates_with
       (user1_id, skill1_id, user2_id, skill2_id, start_date, end_date, status, type)
     values ($1, $2, $3, $4, $5, $6, 'waiting', $7)
     returning *`,
    [user1Id, skill1Id, user2Id, skill2Id, startDate, endDate, type]
  );
}

/**
 * status 'accepted' olunca database.sql'deki trigger_update_points_on_accept
 * tetiklenip iki tarafa da 10 puan ekliyor. Puan mantigini uygulamaya
 * tasimadik; boylece veritabanina baska nereden yazilirsa yazilsin kural bozulmuyor.
 */
export function accept(eventId) {
  return queryOne("update Collaborates_with set status = 'accepted' where event_id = $1 returning *", [eventId]);
}

export function remove(eventId) {
  return query("delete from Collaborates_with where event_id = $1", [eventId]);
}

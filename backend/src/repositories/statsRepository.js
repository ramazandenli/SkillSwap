import { queryOne } from "../config/db.js";

/**
 * stats, tek satir donduren bir view. Icindeki her sutun ayri bir alt sorgu
 * (toplam kullanici, en cok puanli kullanici, en cok sahip olunan yetenek ...).
 * Admin panelindeki butun kutucuklar bu tek istekten besleniyor.
 */
export function findStats() {
  return queryOne("select * from stats");
}

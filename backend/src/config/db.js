import pg from "pg";
import { env } from "./env.js";

/**
 * Tum uygulama tek bir baglanti havuzu uzerinden konusuyor.
 *
 * Neden Client degil de Pool: Client tek bir TCP baglantisi acar, o baglanti
 * mesgulken gelen istekler sirada bekler. Pool ise bir havuz tutar ve es
 * zamanli istekleri farkli baglantilara dagitir. Socket.IO ile birlikte artik
 * ayni anda birden fazla sorgu calisabildigi icin bu fark onemli hale geldi.
 */
export const pool = new pg.Pool(env.database);

/**
 * Repository katmani sadece bunu cagirir; pool nesnesini disari sizdirmiyoruz
 * ki ileride baglanti yonetimi degisirse tek yerden degistirilebilsin.
 *
 * @param {string} text parametreli SQL ($1, $2 ...)
 * @param {Array} params SQL parametreleri
 * @returns {Promise<Array>} donen satirlar
 */
export async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

/**
 * Tek satir donmesi beklenen sorgular icin kisayol.
 * Satir yoksa undefined yerine null donuyor ki kontrol etmesi net olsun.
 */
export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

export async function connectDatabase() {
  // Havuzdan bir baglanti alip hemen birakiyoruz: amac, yanlis .env ile
  // sunucunun sessizce ayaga kalkip ilk istekte patlamasini engellemek.
  const client = await pool.connect();
  client.release();
}

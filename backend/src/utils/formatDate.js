/**
 * Postgres'ten gelen date/timestamp degerleri Node tarafinda Date nesnesine
 * cevriliyor, JSON'a serilestirilince de "2024-11-03T21:00:00.000Z" gibi UTC
 * bir metne donusuyor. Turkiye UTC+3 oldugu icin bu, dogum tarihinin bir gun
 * geri kaymasina sebep oluyordu.
 *
 * Cozum: tarihi hic UTC'ye cevirmeden, yerel bilesenlerinden YYYY-MM-DD
 * metnini kendimiz kuruyoruz.
 *
 * @param {Date|string|null} value
 * @returns {string|null} YYYY-MM-DD
 */
export function toISODate(value) {
  if (!value) return null;

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Bir nesnenin secilen tarih alanlarini yerinde YYYY-MM-DD'ye cevirir.
 * Ayni donusum eskiden profil, etkinlik ve degerlendirme uclusunde
 * kopyala-yapistir duruyordu; artik tek yerden geciyor.
 *
 * @param {Object} row
 * @param {string[]} fields cevrilecek alan adlari
 */
export function formatDateFields(row, fields) {
  if (!row) return row;

  for (const field of fields) {
    if (field in row) {
      row[field] = toISODate(row[field]);
    }
  }

  return row;
}

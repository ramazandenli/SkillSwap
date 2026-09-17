/**
 * Yildizli puan. Iki isi de goruyor:
 *   - onChange verilmezse salt okunur (yorum listesinde),
 *   - onChange verilirse tiklanabilir (yorum yazma formunda).
 *
 * Tiklanabilir halde <button> kullaniyoruz ki klavyeyle de secilebilsin;
 * salt okunur halde ise butona gerek yok, sadece metin okunuyor.
 */
function StarRating({ value = 0, onChange, size = "md" }) {
  const stars = [1, 2, 3, 4, 5];
  const readOnly = !onChange;

  if (readOnly) {
    return (
      <span className={`stars stars--${size}`} aria-label={`5 uzerinden ${value} puan`}>
        {stars.map((star) => (
          <span key={star} className={star <= Math.round(value) ? "star star--on" : "star"}>
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`stars stars--${size}`} role="group" aria-label="Puan secin">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? "star star--on star--button" : "star star--button"}
          onClick={() => onChange(star)}
          aria-label={`${star} yildiz`}
          aria-pressed={star === value}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default StarRating;

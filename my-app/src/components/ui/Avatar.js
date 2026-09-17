/**
 * Kullanicilarin yuklenmis fotografi yok; kullanici adinin ilk harfinden
 * renkli bir daire uretiyoruz.
 *
 * Renk rastgele degil, kullanici adindan hesaplaniyor: ayni kisi her yerde
 * ayni rengi aliyor, boylece listede goz onu tanimaya aliyor.
 */
function Avatar({ username = "", size = "md" }) {
  const initial = username.charAt(0).toUpperCase() || "?";

  // Basit bir toplam: harflerin kod degerlerini toplayip 360 dereceye yayiyoruz.
  const hue = [...username].reduce((total, char) => total + char.charCodeAt(0), 0) % 360;

  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ backgroundColor: `hsl(${hue} 55% 32%)`, color: `hsl(${hue} 90% 88%)` }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

export default Avatar;

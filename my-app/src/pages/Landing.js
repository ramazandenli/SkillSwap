import { Link } from "react-router-dom";
import "../styles/auth.css";

/**
 * Giris yapmamis ziyaretcinin gordugu ilk ekran.
 * Uygulamanin ne yaptigini bir cumlede anlatip iki yola ayiriyor.
 */
function Landing() {
  return (
    <div className="auth-page">
      <div className="auth-hero">
        <img src="/logo.png" alt="SkillSwap" className="auth-hero__logo" />
        <h1 className="auth-hero__title">Bildigini ogret, bilmedigini ogren.</h1>
        <p className="auth-hero__subtitle">
          SkillSwap, sahip oldugun yetenekle ihtiyacin olan yetenegi takas edebilecegin
          kisileri eslestirir. Anlasip takvim belirlersiniz, is bitince birbirinizi
          degerlendirirsiniz.
        </p>

        <div className="auth-hero__actions">
          <Link to="/signup" className="btn btn--primary">
            Hesap olustur
          </Link>
          <Link to="/login" className="btn btn--outline">
            Giris yap
          </Link>
        </div>

        <ul className="auth-hero__points">
          <li>
            <strong>Karsilikli eslesme</strong>
            <span>Sadece sana da faydasi olan kisiler listelenir.</span>
          </li>
          <li>
            <strong>Anlik mesajlasma</strong>
            <span>Socket.IO ile mesajlar sayfa yenilemeden dusar.</span>
          </li>
          <li>
            <strong>Degerlendirme</strong>
            <span>Biten her etkinlikten sonra puan ve yorum yazilir.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Landing;

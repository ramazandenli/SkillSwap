import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import Avatar from "../ui/Avatar.js";

/**
 * Giris yapmis kullanicinin gordugu her sayfanin ortak cercevesi:
 * ust bar + icerik alani. Sayfalar sadece kendi icerigini yaziyor.
 */
function AppShell({ children, nav = null }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  // logout artik sunucuya da gidiyor (cerezi orasi siliyor), bu yuzden
  // yonlendirmeden once bitmesini bekliyoruz.
  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to={`/home/${username}`} className="topbar__brand">
          <img src="/logo.png" alt="" className="topbar__logo" />
          <span>SkillSwap</span>
        </Link>

        {nav && <nav className="topbar__nav">{nav}</nav>}

        <div className="topbar__user">
          <Avatar username={username || ""} size="sm" />
          <span className="topbar__username">{username}</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Cikis
          </button>
        </div>
      </header>

      <main className="shell__content">{children}</main>
    </div>
  );
}

export default AppShell;

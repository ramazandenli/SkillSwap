import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { Loading } from "./ui/StateMessage.js";

/**
 * Oturum yoksa giris sayfasina yonlendirir.
 *
 * Ilk kosul onemli: oturum bilgisi artik sunucudan geliyor (token httpOnly
 * cerezde oldugu icin istemci onu okuyamiyor). Cevap gelmeden karar
 * verseydik, sayfa her yenilendiginde giris yapmis kullanici bile bir an
 * icin "oturumsuz" gorunup giris ekranina atilirdi.
 *
 * adminOnly ile admin paneli de ayni bilesenle korunuyor; eskiden admin
 * sayfasi da sadece "giris yapilmis mi" diye bakiyordu, yani normal bir
 * kullanici adresi elle yazarak paneli acabiliyordu.
 *
 * replace: true -> tarayici gecmisine korunan adres yazilmiyor, boylece
 * geri tusu kullaniciyi tekrar ayni yonlendirmeye sokmuyor.
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { status, isLoggedIn, isAdmin, username } = useAuth();

  if (status === "loading") {
    return (
      <div className="route-loading">
        <Loading label="Oturum kontrol ediliyor..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={`/home/${username}`} replace />;
  }

  return children;
}

export default ProtectedRoute;

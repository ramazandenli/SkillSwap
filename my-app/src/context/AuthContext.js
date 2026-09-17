import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.js";
import { disconnectSocket } from "../lib/socket.js";

const AuthContext = createContext(null);

/**
 * Oturum durumu.
 *
 * Token httpOnly bir cerezde ve JavaScript onu okuyamiyor. Bunun dogrudan
 * sonucu: istemci "kim oldugunu" kendi basina bilemez. Bu yuzden uygulama
 * her acildiginda sunucuya bir kere soruyor (GET /api/auth/me).
 *
 * Eskiden oturum localStorage'da duruyordu ve okumak eszamanliydi; artik
 * bir bekleme adimi var. `status` alani tam da bunun icin: ProtectedRoute
 * cevap gelmeden karar verirse, sayfa her yenilendiginde giris yapmis
 * kullaniciyi bile giris ekranina atardi.
 */
export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Bilesen sokulurse gelen cevabin state yazmasini engelliyoruz.
    let cancelled = false;

    authApi
      .me()
      .then((currentSession) => {
        if (!cancelled) setSession(currentSession);
      })
      .catch(() => {
        // 401 burada beklenen bir sonuc: oturum yok demek.
      })
      .finally(() => {
        if (!cancelled) setStatus("ready");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Giris/kayit sonrasi: sunucu cerezi zaten yazdi, burada yalnizca
  // arayuzun bildigi kimligi guncelliyoruz.
  const login = useCallback((newSession) => {
    setSession(newSession);
    setStatus("ready");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Cerez zaten gecersizse sunucu 401 doner. Kullanici acisindan sonuc
      // ayni: yerel oturumu her halukarda kapatiyoruz.
    }

    // Soketi de kapatiyoruz; aksi halde cikis yapan kullanici mesaj
    // olaylarini dinlemeye devam ederdi.
    disconnectSocket();
    setSession(null);
  }, []);

  // useMemo olmasaydi bu nesne her render'da yeniden olusur ve context'i
  // dinleyen tum bilesenler bosuna yeniden render edilirdi.
  const value = useMemo(
    () => ({
      status,
      session,
      username: session?.username ?? null,
      isLoggedIn: Boolean(session),
      isAdmin: session?.type === "admin",
      login,
      logout,
    }),
    [status, session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth yalnizca AuthProvider icinde kullanilabilir.");
  }

  return context;
}

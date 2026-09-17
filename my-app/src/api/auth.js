import client from "./client.js";

/**
 * Kayit ve giris yanitlari yalnizca { username, type } donuyor.
 * Token yanit govdesinde yok; sunucu onu httpOnly cerez olarak yaziyor ve
 * istemci token'i hic gormuyor.
 */
export const signup = (user) => client.post("/auth/signup", user);

export const login = (credentials) => client.post("/auth/login", credentials);

/** Cerezi sunucuya sildiriyor. */
export const logout = () => client.post("/auth/logout");

/**
 * Acilistaki "ben kimim" sorgusu.
 *
 * Token cerezde ve okunamaz oldugu icin, sayfa yenilendiginde kullanicinin
 * kim oldugunu ancak sunucuya sorarak ogrenebiliyoruz.
 *
 * skipAuthRedirect: oturum yoksa bu cagri 401 doner ve bu tamamen normal
 * bir sonuc. Genel 401 davranisi olan "giris ekranina at" burada
 * calismamali, yoksa acilis sayfasi bile giris ekranina zorlanirdi.
 */
export const me = () => client.get("/auth/me", { skipAuthRedirect: true });

import axios from "axios";

/**
 * Sunucu adresi tek yerde.
 *
 * Eskiden "http://localhost:4000/..." metni bilesenlerin icinde otuz kusur
 * yerde tekrar ediyordu; adres degisince hepsini tek tek bulmak gerekiyordu.
 * Artik tek bir axios ornegi var ve adres .env'den okunuyor.
 */
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },

  /**
   * Oturum token'i httpOnly bir cerezde tasiniyor.
   *
   * withCredentials olmadan tarayici, farkli porttaki API'ye giden
   * isteklere cerezi EKLEMEZ ve her istek 401 donerdi. Sunucu tarafinda da
   * bunun karsiligi olan `credentials: true` ayari var.
   *
   * Burada Authorization basligi kuran bir aracilik yok; olamaz da:
   * httpOnly cerezi JavaScript okuyamaz. Token'i hic gormuyoruz, tarayici
   * onu bizim adimiza tasiyor. Tam da istedigimiz sey bu — sayfaya sizan
   * bir XSS betigi token'i calip disari kaciramaz.
   */
  withCredentials: true,
});

/**
 * Yanit araciligi uc isi yapiyor:
 *
 * 1. Basarili yanitlarda response.data'yi dogrudan donuyor, boylece cagiran
 *    taraf her seferinde ".data" yazmiyor.
 * 2. 401 gelirse (cerez yok, bozuk veya suresi dolmus) kullaniciyi giris
 *    ekranina atiyor. 403'te bunu YAPMIYOR: 403 "kimsin biliyorum ama
 *    yetkin yok" demek, oturumu kapatmak icin sebep degil.
 * 3. Diger hatalarda sunucunun gonderdigi { message } alanini okunabilir bir
 *    Error'a ceviriyor.
 */
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Sunucuya ulasilamadi. Backend calisiyor mu?"));
    }

    const { status, data } = error.response;

    // skipAuthRedirect: acilistaki "ben kimim" sorgusu icin. O cagri zaten
    // "oturum var mi" diye soruyor; 401 beklenen bir cevap, yonlendirme
    // sebebi degil.
    const shouldRedirect = status === 401 && !error.config?.skipAuthRedirect;

    if (shouldRedirect && !window.location.pathname.startsWith("/login")) {
      window.location.replace("/login");
    }

    const wrapped = new Error(data?.message || "Beklenmeyen bir hata olustu.");
    wrapped.status = status;

    return Promise.reject(wrapped);
  }
);

export default client;

import * as messageRepository from "../repositories/messageRepository.js";
import { verifyToken } from "../utils/jwt.js";
import { readAuthCookie } from "../utils/cookies.js";
import { LIMITS } from "../utils/validate.js";

/**
 * Canli sohbet.
 *
 * Temel fikir: her kullanici, kullanici adiyla ayni isimde bir "room"a
 * katiliyor. Bir mesaj kaydedildiginde onu iki room'a birden yayinliyoruz
 * (gonderen + alici). Boylece:
 *   - alici sayfayi yenilemeden mesaji goruyor,
 *   - gonderen de ayni satiri geri aldigi icin iki taraf ayni text_id ve ayni
 *     zaman damgasini goruyor (iyimser guncelleme yapmadigimiz icin
 *     "gorunen mesaj ile kayitli mesaj farkli" sorunu olusmuyor),
 *   - kullanici birden fazla sekmede acikken hepsi ayni anda guncelleniyor.
 *
 * Mesaj gonderme HTTP'de degil burada; kaydetme ve yayinlama tek adim.
 */
export function registerChatHandlers(io) {
  /**
   * Baglanti oncesi kimlik dogrulama.
   *
   * io.use, HTTP tarafindaki requireAuth'un soket karsiligi: baglanti
   * kurulmadan once calisiyor ve next(hata) cagrilirsa baglanti hic acilmiyor.
   *
   * Bu, eski `chat:join` olayinin yerini aldi. Onceki tasarimda istemci
   * "ben suyum" diyor ve sunucu buna inaniyordu; yani herhangi biri
   * baskasinin adini yazip onun room'una katilabilir, ona gelen tum
   * mesajlari canli dinleyebilirdi.
   *
   * Not: cerez tabanli oldugu icin baglanti da CORS'a tabi. Sunucu
   * yalnizca CLIENT_ORIGIN adresinden gelen el sikismalarini kabul ediyor.
   *
   * Token, HTTP tarafiyla ayni httpOnly cerezden okunuyor. El sikismasi
   * normal bir HTTP istegiyle basladigi icin tarayici cerezi kendisi
   * ekliyor; bize ham baslik metni olarak ulasiyor ve `readAuthCookie`
   * onu ayristiriyor.
   *
   * Istemcinin `withCredentials: true` demesi sart — aksi halde tarayici
   * cross-origin el sikismasina cerezi eklemez.
   */
  io.use((socket, next) => {
    const token = readAuthCookie(socket.handshake.headers?.cookie);

    if (!token) {
      return next(new Error("Kimlik dogrulanamadi."));
    }

    try {
      const user = verifyToken(token);
      socket.data.username = user.username;
      next();
    } catch {
      next(new Error("Oturum gecersiz veya suresi dolmus."));
    }
  });

  io.on("connection", (socket) => {
    const username = socket.data.username;

    // Kullanicinin kendi room'u. Birden fazla sekme acikken hepsi ayni
    // room'a girdigi icin mesaj hepsine birden ulasiyor.
    socket.join(username);

    socket.on("chat:send", async (payload) => {
      const to = payload?.to;
      const message = payload?.message?.trim();

      if (!to || !message) {
        return socket.emit("chat:error", { message: "Alici ve mesaj zorunlu." });
      }
      // Mesaj "text" sutununda saklaniyor, yani veritabani uzunlugu
      // sinirlamiyor. Soket uzerinden gelen veri de express.json'un boyut
      // siniriyla korunmuyor; sinir burada konuyor.
      if (message.length > LIMITS.message.max) {
        return socket.emit("chat:error", {
          message: `Mesaj en fazla ${LIMITS.message.max} karakter olabilir.`,
        });
      }
      if (username === to) {
        return socket.emit("chat:error", { message: "Kendinize mesaj gonderemezsiniz." });
      }

      try {
        const saved = await messageRepository.insert({
          // Gonderen kimligi payload'dan degil, dogrulanmis soketten.
          fromId: username,
          toId: to,
          message,
        });

        // Ayni olayi iki room'a yayinliyoruz; Socket.IO ayni sokete iki kez
        // gondermiyor.
        io.to(username).to(to).emit("chat:message", saved);
      } catch (error) {
        console.error("Mesaj kaydedilemedi:", error);
        socket.emit("chat:error", { message: "Mesaj gonderilemedi." });
      }
    });

    /**
     * "yaziyor..." bilgisi. Veritabanina yazilmiyor, sadece karsi tarafa
     * iletiliyor: kalici olmasi gereken bir veri degil.
     */
    socket.on("chat:typing", ({ to, isTyping }) => {
      if (!to) return;

      socket.to(to).emit("chat:typing", { from: username, isTyping: Boolean(isTyping) });
    });
  });
}

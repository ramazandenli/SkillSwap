import { io } from "socket.io-client";
import { API_URL } from "../api/client.js";

/**
 * Uygulama boyunca tek bir Socket.IO baglantisi.
 *
 * Baglantiyi bilesenin icinde acsaydik, her yeniden render veya her sayfa
 * gecisinde yeni bir soket acilir, eskiler kapanmadigi icin ayni mesaji
 * birden fazla kez alirdik. Bu yuzden soketi modul seviyesinde tutup
 * disariya sadece "baglan / kopar / al" fonksiyonlarini veriyoruz.
 */
let socket = null;

/**
 * Kimlik, HTTP tarafiyla ayni httpOnly cerezden geliyor.
 *
 * Socket.IO baglantisi normal bir HTTP el sikismasiyla basliyor; tarayici
 * cerezi o istege kendisi ekliyor. Tek sart `withCredentials: true` —
 * onsuz tarayici farkli porttaki sunucuya cerez gondermez ve sunucu her
 * baglantiyi "Kimlik dogrulanamadi" ile reddederdi.
 *
 * Istemci token'i ne okuyor ne de gonderiyor: eskiden `auth: { token }`
 * alaninda elle tasiniyordu, daha da eskiden istemci `chat:join` ile
 * "ben suyum" diyordu ve sunucu buna inaniyordu.
 */
export function connectSocket() {
  if (!socket) {
    socket = io(API_URL, { autoConnect: false, withCredentials: true });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

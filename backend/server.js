import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDatabase } from "./src/config/db.js";
import { registerChatHandlers } from "./src/sockets/chat.js";

/**
 * Express uygulamasini dogrudan dinletmek yerine elle bir HTTP sunucusu
 * kuruyoruz. Sebep: Socket.IO ile Express ayni portu paylasmali. Socket.IO,
 * WebSocket el sikismasi icin ham HTTP sunucusuna ihtiyac duyuyor;
 * app.listen() bu sunucuyu bize vermiyor.
 */
const server = http.createServer(app);

/**
 * credentials: true olmadan tarayici, el sikismasi istegine oturum cerezini
 * eklemez ve her baglanti "Kimlik dogrulanamadi" ile reddedilirdi.
 */
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true },
});

registerChatHandlers(io);

async function start() {
  try {
    // Once veritabani: yanlis .env ile sunucunun sessizce ayaga kalkip
    // ilk istekte patlamasindansa burada acikca hata vermesi daha iyi.
    await connectDatabase();
    console.log("Veritabani baglantisi kuruldu.");

    server.listen(env.port, () => {
      console.log(`Sunucu ${env.port} portunda calisiyor.`);
      console.log(`Izin verilen istemci adresi: ${env.clientOrigin}`);
    });
  } catch (error) {
    console.error("Sunucu baslatilamadi:", error.message);
    process.exit(1);
  }
}

start();

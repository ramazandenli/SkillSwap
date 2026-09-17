import client from "./client.js";

/**
 * Sohbet gecmisi. Konusmanin bir ucu token'dan geliyor, sadece karsi taraf
 * gonderiliyor. Yeni mesajlar Socket.IO ile geliyor (src/lib/socket.js).
 */
export const getConversation = (peer) => client.get("/messages", { params: { peer } });

export const getContacts = () => client.get("/messages/contacts");

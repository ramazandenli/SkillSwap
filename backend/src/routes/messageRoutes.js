import { Router } from "express";
import * as messageController from "../controllers/messageController.js";

const router = Router();

/*
 * Iki rotada da kullanici adi adresten alinmiyor, token'dan geliyor;
 * bu yuzden ayrica requireSelf gerekmiyor.
 *
 * Not: mesaj GONDERME burada yok. Gonderme islemi Socket.IO uzerinden
 * yuruyor (src/sockets/chat.js), boylece kayit ve yayin tek adimda oluyor.
 */
router.get("/", messageController.getConversation);
router.get("/contacts", messageController.getContacts);

export default router;

import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as authController from "../controllers/authController.js";

const router = Router();

/*
 * Bu rotalar routes/index.js icinde requireAuth'tan ONCE baglaniyor,
 * yani varsayilan olarak aciklar. Oturum gerektiren ikisine korumayi
 * tek tek ekliyoruz.
 */
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Cikis da oturum ister: yoksa zaten silinecek bir cerez yok.
router.post("/logout", requireAuth, authController.logout);

// Istemci acilista oturumunu buradan ogreniyor.
router.get("/me", requireAuth, authController.me);

export default router;

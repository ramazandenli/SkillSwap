import { Router } from "express";
import { requireAdmin, requireSelf } from "../middleware/requireAuth.js";
import * as userController from "../controllers/userController.js";

const router = Router();

/*
 * Okuma rotalari giris yapmis herkese acik: arama sonucunda cikan bir
 * kullanicinin profilini, yeteneklerini ve takipci sayilarini gorebilmek
 * uygulamanin isleyisi icin gerekli.
 *
 * Yazma rotalari ise requireSelf ile korunuyor: kimse baskasinin yetenek
 * listesini degistiremez.
 */

router.get("/", requireAdmin, userController.listUsers);
router.get("/:id", userController.getUserDetail);
router.get("/:id/profile", userController.getProfile);
router.get("/:id/counts", userController.getCounts);
router.get("/:id/followers", userController.getFollowers);
router.get("/:id/followings", userController.getFollowings);
router.get("/:id/skills", userController.getSkills);

router.post("/:id/skills", requireSelf, userController.addSkill);
router.delete("/:id/skills/:skillId", requireSelf, userController.removeSkill);

// Kullanici silme (ban) yalnizca yoneticide.
router.delete("/:id", requireAdmin, userController.deleteUser);

export default router;

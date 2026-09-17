import { Router } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";
import * as skillController from "../controllers/skillController.js";

const router = Router();

// Katalogu herkes okur, yalnizca yonetici degistirir.
router.get("/", skillController.listSkills);
router.post("/", requireAdmin, skillController.createSkill);
router.delete("/:id", requireAdmin, skillController.deleteSkill);

export default router;

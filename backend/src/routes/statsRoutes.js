import { Router } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";
import * as statsController from "../controllers/statsController.js";

const router = Router();

router.get("/", requireAdmin, statsController.getStats);

export default router;

import { Router } from "express";
import * as followController from "../controllers/followController.js";

const router = Router();

router.post("/", followController.follow);
router.delete("/", followController.unfollow);

export default router;

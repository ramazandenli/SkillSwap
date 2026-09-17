import { Router } from "express";
import * as skillController from "../controllers/skillController.js";

const router = Router();

router.get("/", skillController.searchUsers);

export default router;

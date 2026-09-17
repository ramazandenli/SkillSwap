import { Router } from "express";
import { requireSelf } from "../middleware/requireAuth.js";
import * as eventController from "../controllers/eventController.js";

const router = Router();

// Etkinlik listesi kisiye ozel; kabul/red kontrolleri controller icinde,
// cunku kural "taraf olmak" -- adresteki id ile karsilastirilamaz.
router.get("/user/:id", requireSelf, eventController.getEventsForUser);
router.post("/", eventController.createEvent);
router.post("/:id/accept", eventController.acceptEvent);
router.delete("/:id", eventController.rejectEvent);

export default router;

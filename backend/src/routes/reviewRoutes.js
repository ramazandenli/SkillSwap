import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";

const router = Router();

// Bir kullaniciya yazilan yorumlar herkese acik (profil kartinda gorunuyor).
router.get("/user/:id", reviewController.getReviewsForUser);

// Bekleyen degerlendirmeler ve yorum yazma kisiye ozel; kimlik token'dan.
router.get("/pending", reviewController.getPendingReviews);
router.post("/", reviewController.createReview);

export default router;

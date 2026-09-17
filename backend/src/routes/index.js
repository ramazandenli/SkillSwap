import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import skillRoutes from "./skillRoutes.js";
import searchRoutes from "./searchRoutes.js";
import followRoutes from "./followRoutes.js";
import eventRoutes from "./eventRoutes.js";
import messageRoutes from "./messageRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import statsRoutes from "./statsRoutes.js";

/**
 * Tum rotalarin baglandigi yer. app.js bunu /api altina mount ediyor,
 * bu yuzden asagidaki yollar "/api" onekini icermiyor.
 */
const router = Router();

// Giris ve kayit acik olmak zorunda: token'i almak icin gelinen yer burasi.
router.use("/auth", authRoutes);

// Bu satirdan sonraki her rota token istiyor. Korumayi her dosyada tek tek
// eklemek yerine tek yerde toplamak, yeni bir rota eklerken korumayi
// unutma ihtimalini ortadan kaldiriyor: varsayilan artik "korumali".
router.use(requireAuth);

router.use("/users", userRoutes);
router.use("/skills", skillRoutes);
router.use("/search", searchRoutes);
router.use("/follows", followRoutes);
router.use("/events", eventRoutes);
router.use("/messages", messageRoutes);
router.use("/reviews", reviewRoutes);
router.use("/stats", statsRoutes);

export default router;

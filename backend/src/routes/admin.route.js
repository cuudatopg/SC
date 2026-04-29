import { Router } from "express";
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong, updateAlbum, updateSong } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);
router.put("/songs/:id", updateSong)

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);
router.put("/albums/:id", updateAlbum);


export default router;

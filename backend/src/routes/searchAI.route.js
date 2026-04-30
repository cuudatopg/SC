import { Router } from "express";
import { searchAI } from "../controller/search.controller.js";

const router = Router();

// Endpoint: GET /api/search?q=...
router.get("/", searchAI);

export default router;
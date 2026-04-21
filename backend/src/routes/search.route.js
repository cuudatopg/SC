import { Router } from "express";
import { searchAll } from "../controller/search.controller.js";

const router = Router();

// Endpoint: GET /api/search?q=...
router.get("/", searchAll);

export default router;
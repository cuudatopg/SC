import { Router } from "express";
import { searchAI } from "../controller/searchAI.controller.js";

const router = Router();

router.post("/", searchAI);

export default router;  
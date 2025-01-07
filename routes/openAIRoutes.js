import express from "express";
import { getOpenAI } from "../services/openAIService.js";

const router = express.Router();

// Get openAI endpoint
router.get("/", getOpenAI);

export default router;

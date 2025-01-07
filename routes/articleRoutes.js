import express from "express";
import * as articleController from "../controllers/articleController.js";

const router = express.Router();

// get article by id
router.get("/trials", articleController.getTrials);

export default router;

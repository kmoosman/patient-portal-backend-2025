import express from "express";
import {
  protectRouteAndCheckAdmin,
} from "../controllers/loginController.js";
import * as tagController from "../controllers/tagController.js";

const router = express.Router();

// Get all tags
router.get("/", protectRouteAndCheckAdmin, tagController.getAllTags);

export default router;

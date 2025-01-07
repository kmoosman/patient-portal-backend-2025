import express from "express";
const router = express.Router();
import { protectRouteAndCheckAdmin } from "../controllers/loginController.js";
import * as uploadController from "../controllers/uploadController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/",
  protectRouteAndCheckAdmin,
  upload.single("image"),
  uploadController.uploadImage
);

export default router;

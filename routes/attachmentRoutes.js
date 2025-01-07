//todo: move other attachment routes here 
import express from "express";
import * as attachmentRoutes from "../controllers/attachmentController.js";
import multer from 'multer';


const upload = multer({ storage: multer.memoryStorage() });


const router = express.Router();

router.post("/create", upload.single('file'), attachmentRoutes.createAttachment);

export default router;

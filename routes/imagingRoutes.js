import express from "express";
import {
  getAllImagingByPatient,
  getImagingById,
  getAllImagingByDiagnosis,
  getAllAttachmentsForImageRecordById,
  createImaging,
  updateImaging
} from "../controllers/imagingController.js";

const router = express.Router();

// Create a new image record
router.post("/create", createImaging);

// Get images for a specific patient
router.get("/", getAllImagingByPatient);

router.get("/diagnosis/:id", getAllImagingByDiagnosis);

// Get a specific patient image record
router.get("/:id", getImagingById);

// Get get all attachments for image record by id
router.get("/:id/attachments", getAllAttachmentsForImageRecordById);

//Update imaging 
router.patch("/:id/update", updateImaging);


export default router;

import express from "express";
import * as labsController from "../controllers/labsController.js";

const router = express.Router();

// Get all labs for a patient
router.get("/labs", labsController.getAllLabsByPatient);

// Get all labs for a patient by range
router.get("/labs/range", labsController.getAllLabsByPatientBetweenDates);

// Get all lab panels
router.get("/lab/panels", labsController.getAllLabPanels);

// create new labs
router.post("/labs/create", labsController.createLab);

export default router;

import express from "express";
import {
  getAllMedicationsByPatient,
  getPatientMedicationById,
  getAllMedicationsByDiagnosis,
  getAllRelatedMedicationsById,
  createPatientMedication,
  updateMedication
} from "../controllers/medicationController.js";
const router = express.Router();

// Create a new patient medication
router.post("/create", createPatientMedication);

// Get medications for a specific patient
router.get("/", getAllMedicationsByPatient);

// Get medications for a specific diagnosis
router.get("/diagnosis/:id", getAllMedicationsByDiagnosis);

// Get scans for a specific medication
router.get("/:id/scans", getAllMedicationsByDiagnosis);

// Get all related medications to a specific medication
router.get("/:id/related", getAllRelatedMedicationsById);

// Update a medication
router.patch("/:id/update", updateMedication);

// Get a specific patient medication
router.get("/:id", getPatientMedicationById);

export default router;

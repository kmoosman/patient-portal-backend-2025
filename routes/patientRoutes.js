import express from "express";
import {
  getAllTissueSamplesForPatient,
  getAllImportantDocumentsForPatient,
  getAllSequencingForPatient,
  getAllPatientDetails,
  getAllTimelineEventsForPatient,
  getAllAppointmentsForPatient,
  getAllFamilyHistoryForPatient,
  getAppointmentById,
  getAppointmentByDiagnosisId,
  getTimelineEventById,
  updatePatientDetails,
  createTimelineEvent,
  createAppointment,
  updateAppointment,
} from "../controllers/patientController.js";
import { protectRouteAndCheckAdmin } from "../controllers/loginController.js";

const router = express.Router();

// Update the patient details
router.patch("/", protectRouteAndCheckAdmin, updatePatientDetails);

// Get all tissue for patient
router.get("/:id/tissue", getAllTissueSamplesForPatient);

// Get all important documents for patient
router.get("/documents", getAllImportantDocumentsForPatient);

// Get all sequencing for patient
router.get("/sequencing", getAllSequencingForPatient);

// Get all details on a patient
router.get("/", getAllPatientDetails);

// Get all timeline events for a patient
router.get("/timeline", getAllTimelineEventsForPatient);

// Get a specific timeline event todo: move this to timeline routes
router.get("/timeline/:timelineId", getTimelineEventById);

//Create timeline event route
router.post("/timeline/create", createTimelineEvent);

// Get all appointments for a patient
router.get("/appointments", getAllAppointmentsForPatient);

// Get a appointment by appointment Id
router.get("/appointments/:id", getAppointmentById);

// Update appointment route
router.patch("/appointments/:id", updateAppointment);

// Get a appointment by diagnosis Id
router.get("/appointments/diagnosis/:id", getAppointmentByDiagnosisId);

// Get the family history for a patient
router.get("/family-history", getAllFamilyHistoryForPatient);

// Create appointment route
router.post("/appointments/create", createAppointment);

export default router;

import express from "express";
import {
  getAllInterventionsByDiagnosis,
  getAllInterventionsByPatient,
  getInterventionById,
  getAllAttachmentsForInterventionById,
  createIntervention,
  editIntervention
} from "../controllers/interventionsController.js";

const router = express.Router();

//Create new intervention
router.post("/create", createIntervention);

// Get interventions for a specific patient
router.get("/", getAllInterventionsByPatient);

// Get a specific intervention
router.get("/:id", getInterventionById);

// Get interventions for a specific diagnosis
router.get("/diagnosis/:id", getAllInterventionsByDiagnosis);

// Get get all attachments for intervention by id
router.get("/:id/attachments", getAllAttachmentsForInterventionById);

//Update intervention links 
router.patch("/:id/update", editIntervention);
export default router;

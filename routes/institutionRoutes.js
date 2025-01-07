import express from "express";
import {
  createPatientInstitution,
  getAllInstitutionsByPatientController,
  updatePatientInstitution,
  getInstitutionById,
  searchInstitutionByTitleController,
} from "../controllers/institutionController.js";


const router = express.Router();

// Get institutions by patient
router.get("/patient/:id", getAllInstitutionsByPatientController);

//Search for institution by title
router.get("/search", searchInstitutionByTitleController);

// Get institution by id
router.get("/:id", getInstitutionById);

//Update intervention links 
router.patch("/:id/update", updatePatientInstitution);

// Get all institutions
router.get("/", getAllInstitutionsByPatientController);

//Create a new institution
router.post("/create", createPatientInstitution);


export default router;

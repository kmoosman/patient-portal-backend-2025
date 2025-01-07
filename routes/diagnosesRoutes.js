import express from "express";
import * as diagnosesController from "../controllers/diagnosisController.js";

const router = express.Router();

//Get all cancers 
router.get("/cancers", diagnosesController.getAllCancerTypes);

//Get all cancer subtypes
router.get("/cancers/:id/subtypes", diagnosesController.getAllCancerSubtypes);

// Get diagnoses by for a patient
router.get("/", diagnosesController.getAllDiagnosesForPatient);

//Update diagnosis 
router.patch("/:id/update", diagnosesController.updateDiagnosis);

// // Get diagnoses by ID
router.get("/:id", diagnosesController.getDiagnosisById);

// Get get all attachments for diagnosis by id
router.get(
  "/:id/attachments",
  diagnosesController.getAllAttachmentsForDiagnosisById
);

// Get diagnoses by provider
router.get(
  "/provider/:id",
  diagnosesController.getAllDiagnosesForPatientFromProvider
);

// Get diagnoses by instutution
router.get(
  "/institutuion/:id",
  diagnosesController.getAllDiagnosesForPatientFromInstitution
);

// Get providers for a diagnoses
router.get("/:id/providers", diagnosesController.getAllProvidersForDiagnosis);

//Create a new diagnosis
router.post("/create", diagnosesController.createDiagnosis);


// //Create new cancer 
// router.post("/cancer/create", diagnosesController.createCancer);



//Create new cancer subtype
router.post("/cancer/subtype/create", diagnosesController.createCancerSubtype);

export default router;

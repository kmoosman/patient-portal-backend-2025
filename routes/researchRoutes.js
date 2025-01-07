import express from "express";
import * as researchController from "../controllers/researchContoller.js";

const router = express.Router();

// Get all research interests for a patient
router.get(
  "/",
  researchController.getAllResearchOfInterestByPatientId
);

// Get all research interest by id
router.get("/:id", researchController.getResearchInterestById);

// Create a research interest
router.post("/create", researchController.createResearchInterest);

// Update a research interest
router.post("/update", researchController.updateResearchInterest);

// Create a research intrest link
router.post("/:id/create-link", researchController.createResearchInterestLink);

// Update a research interest link
router.post("/:id/update-link", researchController.updateResearchInterestLink);

// Create research interest comment
router.post("/:id/create-comment", researchController.createResearchComment);

// Update research interest comment
router.post("/:id/update-comment", researchController.updateResearchComment);

export default router;

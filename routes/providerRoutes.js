import express from "express";
import * as providerController from "../controllers/providerController.js";
import { protectRouteAndCheckAdmin } from "../controllers/loginController.js";

const router = express.Router();

router.get("/npi", providerController.getAllProvidersNPI);

// Update a provider
router.patch("/:id/update", providerController.updateProvider);

// Get providers by provider id
router.get("/:id", providerController.getProviderByProviderId);

// Get all providers for a patient
router.get("/", providerController.getAllProvidersForPatient);

// create a new provider
router.post("/create", protectRouteAndCheckAdmin, providerController.createProvider);






export default router;

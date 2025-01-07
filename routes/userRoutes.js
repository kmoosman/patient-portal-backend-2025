import express from "express";
import * as userController from "../controllers/userController.js";
import {
  protectRouteAndCheckAdmin,
} from "../controllers/loginController.js";


const router = express.Router();

// Get roles by organization for a user
router.get("/:id/admin", protectRouteAndCheckAdmin, userController.isUserAdmin);

router.get("/auth/access", userController.getAllPatientIds);

export default router;

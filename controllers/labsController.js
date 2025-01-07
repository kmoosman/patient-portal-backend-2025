import {
  getAllLabsByPatientService,
  getAllLabsByPatientBetweenDatesService,
  createLabService,
  getAllLabPanelsService,
} from "../services/labsService.js";
import clerkClient from "@clerk/clerk-sdk-node";
import { isUserAdminService } from "../services/userService.js";
import { v4 as uuidv4 } from "uuid";

//Get all labs for a patient
export const getAllLabsByPatient = async (req, res) => {
  try {
    const id = req.patientId;
    let highlighted = false;
    const accessLevel = req.accessLevel;
    const lastLogin = req.query.lastLogin;
    if (req.query.highlighted === "true") {
      highlighted = true;
    }
    const labs = await getAllLabsByPatientService({ id, highlighted, lastLogin, accessLevel });
    if (labs) {
      res.json(labs);
    } else {
      res.status(404).json({ error: "Labs not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch labs" });
  }
};

//Get all lab panels
export const getAllLabPanels = async (req, res) => {
  try {
    const labPanels = await getAllLabPanelsService();
    if (labPanels) {
      res.json(labPanels);
    } else {
      res.status(404).json({ error: "Lab panels not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lab panels" });
  }
};

//Get all labs for a patient between specific date range
export const getAllLabsByPatientBetweenDates = async (req, res) => {
  try {
    const id = req.patientId;
    const startDate = req.query.startDate;
    const daysBefore = req.query.daysBefore;
    const daysAfter = req.query.daysAfter;
    const accessLevel = req.accessLevel;
    let highlighted = false;
    if (req.query.highlighted === "true") {
      highlighted = true;
    }
    const labs = await getAllLabsByPatientBetweenDatesService({
      id,
      startDate,
      daysBefore,
      daysAfter,
      highlighted,
      accessLevel
    }
    );
    if (labs) {
      res.json(labs);
    } else {
      res.status(404).json({ error: "Labs not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch labs" });
  }
};

//create a new lab
export const createLab = async (req, res) => {
  try {
    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const patientId = req.patientId;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to create labs" });
    }

    const {
      institution,
      provider,
      panel,
      panelFields,
      notes,
      startDate,
    } = req.body.data;

    const providerId = provider.providerId;
    const institutionId = institution.institutionId;

    const panelId = uuidv4(); // Generate a UUID for the panel
    const newLab = await createLabService(
      panelId,
      institutionId,
      providerId,
      panel,
      notes,
      panelFields,
      patientId,
      startDate
    );

    if (newLab) {
      res.json(newLab);
    } else {
      res.status(404).json({ error: "Lab not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create lab" });
  }
};

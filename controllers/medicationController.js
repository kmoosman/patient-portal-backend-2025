import {
  getAllMedicationsByDiagnosisService,
  getAllMedicationsByPatientService,
  getPatientMedicationByIdService,
  getAllRelatedMedicationsByIdService,
  createPatientMedicationService,
  createMedicationService,
  searchMedicationsByTitleService,
  updateMedicationService
} from "../services/medicationService.js";
import { isUserAdminService } from "../services/userService.js";
import clerkClient from "@clerk/clerk-sdk-node";


export const getAllMedicationsByPatient = async (req, res) => {
  const id = req.patientId;
  const accessLevel = req.accessLevel;
  const lastLogin = req.query.lastLogin;

  try {

    const medications = await getAllMedicationsByPatientService({
      id,
      lastLogin,
      accessLevel
    });
    if (medications) {
      res.json(medications);
    } else {
      res.status(404).json({ error: "Medications not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch medications." });
  }
};

export const getAllMedicationsByDiagnosis = async (req, res) => {

  try {
    const diagnosisId = req.params.id;
    const accessLevel = req.accessLevel;
    const medications = await getAllMedicationsByDiagnosisService({ id: diagnosisId, accessLevel });
    if (medications) {
      res.json(medications);
    } else {
      res.status(404).json({ error: "Medications not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch medications." });
  }
};

export const getPatientMedicationById = async (req, res) => {
  const id = req.params.id;
  try {
    const accessLevel = req.accessLevel;
    const medication = await getPatientMedicationByIdService({ id, accessLevel });
    if (medication) {
      res.json(medication);
    } else {
      res.status(404).json({ error: "Medication not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch medication." });
  }
};

export const getAllRelatedMedicationsById = async (req, res) => {
  try {
    const medicationId = req.params.id;
    const accessLevel = req.accessLevel;
    const medication = await getAllRelatedMedicationsByIdService({ id: medicationId, accessLevel });
    if (medication) {
      res.json(medication);
    } else {
      res.status(404).json({ error: "Medication not found." });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to fetch medication." });
  }
};


export const createPatientMedication = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;

    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to add medications for this user" });
    }
    const medication = req.body.data;
    //todo: refactor this 
    const patientMedication = {
      patientId: patientId,
      prescribingProvider: medication.prescribingProvider,
      startDate: medication.startDate,
      endDate: medication.endDate,
      status: medication.status,
      dosage: medication.dosage,
      units: medication.units ? medication.units : null,
      notes: medication.notes,
      diagnosis: medication.diagnosis,
      reason: medication.reason,
      alternative: medication.alternative,
      accessLevelId: medication.accessLevelId,
      title: medication.title,
      frequency: medication.frequency,
      interval: medication.interval
    }
    const existingMedication = await searchMedicationsByTitleService(medication.title);
    if (existingMedication) {
      patientMedication.medicationId = existingMedication.id;
      const createdPatientMedication = await createPatientMedicationService(patientMedication);
      if (createdPatientMedication) {
        res.json(medication.id);
      } else {
        res.status(404).json({ error: "Unable to create medication" });
      }
    } else {
      const createdMedication = await createMedicationService(medication);
      patientMedication.medicationId = createdMedication[0].id;
      const createdPatientMedication = await createPatientMedicationService(patientMedication);
      if (createdPatientMedication) {
        res.json(medication.id);
      } else {
        res.status(404).json({ error: "Unable to create medication" });
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create medication." });
  }
}

//update medication 
export const updateMedication = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to edit medications for this user" });
    }

    const medication = req.body.payload;
    const patientMedication = {
      id: medication.id,
      patientId: patientId,
      medicationId: medication.id,
      prescribingProvider: medication.prescribingProvider,
      startDate: medication.startDate,
      endDate: medication.endDate,
      status: medication.status,
      dosage: medication.dosage,
      units: medication.units ? medication.units : null,
      notes: medication.notes,
      diagnosis: medication.diagnosis || null,
      reason: medication.reason,
      alternative: medication.alternative,
      accessLevelId: medication.accessLevelId,
      title: medication.title,
      frequency: medication.frequency,
      interval: medication.interval
    };

    const updatedMedication = await updateMedicationService(patientMedication);

    if (updatedMedication) {
      res.json(updatedMedication);
    } else {
      res.status(404).json({ error: "Unable to update medication" });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to update medication." });
  }
}
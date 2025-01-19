import {
  getAllTissueSamplesForPatientService,
  getAllAttachmentsByCategoryForPatientService,
  getAllPatientDetailsService,
  getAllTimelineEventsForPatientService,
  getAllAppointmentsForPatientService,
  getAllFamilyHistoryForPatientService,
  getAppointmentByIdService,
  getAllAppointmentsByDiagnosisService,
  getTimelineEventByIdService,
  updatePatientDetailsService,
  createTimelineEventService,
  updateAppointmentService,
} from "../services/patientService.js";
import { isUserAdminService } from "../services/userService.js";
import clerkClient from "@clerk/clerk-sdk-node";

export const getAllPatientDetails = async (req, res) => {
  try {
    const patientId = req.patientId;
    const patient = await getAllPatientDetailsService(patientId);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: "Patient not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient." });
  }
};

export const getAllAppointmentsForPatient = async (req, res) => {
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const appointments = await getAllAppointmentsForPatientService({
      id: patientId,
      accessLevel,
    });
    if (appointments) {
      res.json(appointments);
    } else {
      res.status(404).json({ error: "Appointments not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
};

export const getAppointmentById = async (req, res) => {
  const id = req.params.id;
  try {
    const accessLevel = req.accessLevel;
    const appointments = await getAppointmentByIdService({ id, accessLevel });
    if (appointments) {
      res.json(appointments);
    } else {
      res.status(404).json({ error: "Appointment not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment." });
  }
};

export const getAppointmentByDiagnosisId = async (req, res) => {
  try {
    const diagnosisId = req.params.id;
    const accessLevel = req.accessLevel;
    const appointments = await getAllAppointmentsByDiagnosisService({
      id: diagnosisId,
      accessLevel,
    });
    if (appointments) {
      res.json(appointments);
    } else {
      res.status(404).json({ error: "Appointment not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch appointment." });
  }
};

export const getAllFamilyHistoryForPatient = async (req, res) => {
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const familyHistory = await getAllFamilyHistoryForPatientService({
      id: patientId,
      accessLevel,
    });
    if (familyHistory) {
      res.json(familyHistory);
    } else {
      res.status(404).json({ error: "Familiy history not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch family history." });
  }
};

export const getAllTimelineEventsForPatient = async (req, res) => {
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const timeline = await getAllTimelineEventsForPatientService({
      id: patientId,
      accessLevel,
    });

    if (timeline) {
      res.json(timeline);
    } else {
      res.status(404).json({ error: "Timeline events not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch timeline events." });
  }
};

export const getTimelineEventById = async (req, res) => {
  const timelineId = req.params.timelineId;
  console.log(timelineId);
  try {
    const accessLevel = req.accessLevel;
    const timeline = await getTimelineEventByIdService({
      id: timelineId,
      accessLevel,
    });
    if (timeline) {
      res.json(timeline);
    } else {
      res.status(404).json({ error: "Timeline events not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch timeline events." });
  }
};

export const getAllTissueSamplesForPatient = async (req, res) => {
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const tissue = await getAllTissueSamplesForPatientService({
      id: patientId,
      accessLevel,
    });
    if (tissue) {
      res.json(tissue);
    } else {
      res.status(404).json({ error: "Tissue not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tissue." });
  }
};

export const getAllImportantDocumentsForPatient = async (req, res) => {
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const categoryType = "important_document";
    const documents = await getAllAttachmentsByCategoryForPatientService({
      id: patientId,
      category: categoryType,
      accessLevel,
    });
    if (documents) {
      res.json(documents);
    } else {
      res.status(404).json({ error: "Documents not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch documents." });
  }
};

export const getAllSequencingForPatient = async (req, res) => {
  const id = req.params.id;
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const categoryType = "sequencing";
    const sequencing = await getAllAttachmentsByCategoryForPatientService({
      id: patientId,
      category: categoryType,
      accessLevel,
    });
    if (sequencing) {
      res.json(sequencing);
    } else {
      res.status(404).json({ error: "Sequencing not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch documents." });
  }
};

export const updatePatientDetails = async (req, res) => {
  const patientId = req.patientId;
  try {
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const patientDetails = req.body.data;
    //check everything in the request body to ensure there are no empty strings, if there are, replace them with null
    for (let key in patientDetails) {
      if (patientDetails[key] === "") {
        patientDetails[key] = null;
      }
    }

    const patient = await updatePatientDetailsService({
      id: patientId,
      patient: patientDetails,
    });
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: "Patient not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update patient." });
  }
};

//create timeline event
export const createTimelineEvent = async (req, res) => {
  const patientId = req.patientId;
  try {
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);
    if (!isAdmin) {
      return res.status(403).json({
        error:
          "You do not have permission to add a timeline event for this user",
      });
    }
    const timelineEvent = req.body.data.data;
    const event = await createTimelineEventService({
      id: patientId,
      timelineEvent,
    });
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: "Failed to create timeline event." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to create timeline event." });
  }
};

export const createAppointment = async (req, res) => {
  const patientId = req.patientId;
  try {
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);
    if (!isAdmin) {
      return res.status(403).json({
        error: "You do not have permission to add an appointment for this user",
      });
    }
    const appointment = req.body.data.data;
    const event = await createAppointmentService({
      id: patientId,
      appointment,
    });
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: "Failed to create appointment." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to create appointment." });
  }
};

//update appointment
export const updateAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const appointment = req.body.data.data;
  try {
    const event = await updateAppointmentService({
      id: appointmentId,
      appointment,
    });
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: "Failed to update appointment." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment." });
  }
};

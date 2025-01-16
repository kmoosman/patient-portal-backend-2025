import {
  getAllImagingByPatientService,
  getImagingByIdService,
  getAllImagingByDiagnosisService,
  getAllAttachmentsForImageRecordByIdService,
  createImagingService,
  getDiagnosisByImagingIdService,
  removeImagingDiagnosisService,
  createDiagnosisImagingService,
  updateImagingService,
} from "../services/imagingService.js";
import clerkClient from "@clerk/clerk-sdk-node";
import { isUserAdminService } from "../services/userService.js";
import { getDiagnosisByIdService } from "../services/diagnosisService.js";
import { getPresignedUrlService } from "../services/attachmentService.js";
import { processAttachmentLink } from "../helpers/utils.js";

export const getAllImagingByPatient = async (req, res) => {
  const id = req.params.id;
  try {
    const patientId = req.patientId;
    const lastLogin = req.query.lastLogin;
    const accessLevel = req.accessLevel;
    const imaging = await getAllImagingByPatientService({
      id: patientId,
      lastLogin,
      accessLevel,
    });

    const imagingWithDiagnosisPromises = imaging.map(async (image) => {
      const diagnoses = await getDiagnosisByImagingIdService(
        image.id,
        accessLevel
      );
      return { ...image, diagnoses: diagnoses || [] };
    });
    const imagingWithDiagnosis = await Promise.all(
      imagingWithDiagnosisPromises
    );

    if (imagingWithDiagnosis) {
      res.json(imagingWithDiagnosis);
    } else {
      res.status(404).json({ error: "Imaging not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch imaging." });
  }
};

export const getAllImagingByDiagnosis = async (req, res) => {
  const id = req.params.id;
  const accessLevel = req.accessLevel;
  try {
    const patientId = req.params.id;
    const imaging = await getAllImagingByDiagnosisService(
      patientId,
      accessLevel
    );

    const imagingWithDiagnosisPromises = imaging.map(async (image) => {
      const diagnoses = await getDiagnosisByImagingIdService(
        image.id,
        accessLevel
      );
      return { ...image, diagnoses: diagnoses || [] };
    });
    const imagingWithDiagnosis = await Promise.all(
      imagingWithDiagnosisPromises
    );

    if (imaging) {
      res.json(imagingWithDiagnosis);
    } else {
      res.status(404).json({ error: "Imaging not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch imaging." });
  }
};

export const getImagingById = async (req, res) => {
  const id = req.params.id;
  try {
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const imaging = await getImagingByIdService(patientId, accessLevel);
    const diagnoses = await getDiagnosisByImagingIdService(
      imaging.id,
      accessLevel
    );
    imaging.diagnoses = diagnoses || [];
    if (imaging) {
      res.json(imaging);
    } else {
      res.status(404).json({ error: "Imaging not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch imaging." });
  }
};

export const getAllAttachmentsForImageRecordById = async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const attachments = await getAllAttachmentsForImageRecordByIdService(
      id,
      accessLevel
    );
    if (attachments) {
      const attachmentsWithUrls = await Promise.all(
        attachments.map(async (attachment) => ({
          ...attachment,
          link: attachment.link
            ? await processAttachmentLink(attachment.link)
            : null,
        }))
      );
      res.json(attachmentsWithUrls);
    } else {
      res.status(404).json({ error: "Attachments not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachments." });
  }
};

export const createImaging = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin (Todo: refactor this into a function)
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res.status(403).json({
        error: "You do not have permission to add imaging for this user",
      });
    }

    const imaging = req.body.data;
    //todo: refactor this
    const patientImaging = {
      patientId: patientId,
      imagingId: imaging?.id ?? null,
      title: imaging.title || null,
      institution: imaging.institution.institutionId || null,
      accessLevelId: imaging.accessLevelId || 5,
      providerId: imaging.provider.providerId || null,
      notes: imaging.notes || null,
      listOrder: imaging.listOrder || 0,
      startDate: imaging.startDate || new Date().toISOString(),
      endDate: imaging.endDate || null,
      status: imaging.status || "active",
      modality: imaging.modality || null,
      location: imaging.location || [],
      impression: imaging.impression || null,
      reason: imaging.reason || null,
      report: imaging.report || null,
      diagnoses: imaging.diagnoses || [],
      metadata: {
        locations: imaging.location || [],
      },
    };

    const createdImaging = await createImagingService(patientImaging);
    // link newly created imaging to patient
    patientImaging.imagingId = createdImaging[0].id;

    //link imaging to diagnosis
    imaging.diagnoses.map(async (diagnosis) => {
      const existingDiagnosis = await getDiagnosisByIdService({
        id: diagnosis,
        accessLevel,
      });
      if (existingDiagnosis.length > 0) {
        const linkedDiagnosisToImaging = await createDiagnosisImagingService({
          diagnosisId: existingDiagnosis[0].id,
          imagingId: createdImaging[0].id,
          patientId: patientId,
        });
      }
    });
    if (createdImaging) {
      res.json(imaging.id);
    } else {
      res.status(404).json({ error: "Unable to create imaging" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create imaging." });
  }
};

export const updateImaging = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res.status(403).json({
        error: "You do not have permission to edit imaging for this user",
      });
    }

    const imaging = req.body.data;
    const patientImaging = {
      patientId: patientId,
      imagingId: imaging.id,
      title: imaging.title || null,
      institution:
        imaging.institution.length > 0 ? imaging.institution[0].id : null,
      accessLevelId: imaging.accessLevelId || 5,
      providerId:
        imaging.orderingProvider.length > 0
          ? imaging.orderingProvider[0].id
          : null,
      category: imaging.category || null,
      notes: imaging.notes || null,
      listOrder: imaging.listOrder || 0,
      startDate: imaging.startDate || new Date().toISOString(),
      endDate: imaging.endDate || null,
      status: imaging.status || "active",
      modality: imaging.modality || null,
      location: imaging.location || [],
      impression: imaging.impression || null,
      reason: imaging.reason || null,
      report: imaging.report || null,
      diagnoses: imaging.diagnoses || [],
      metadata: imaging.metadata || [],
    };

    const updatedImage = await updateImagingService(patientImaging);
    if (updatedImage) {
      const updatedLinks = await updateImagingLinks(
        patientImaging,
        accessLevel
      );
      res.json({
        createdLinks: updatedLinks.createdLinks,
        removedLinks: updatedLinks.removedLinks,
        imaging: patientImaging.imagingId,
      });
    } else {
      res.status(404).json({ error: "Unable to update imaging" });
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to edit imaging." });
  }
};

const updateImagingLinks = async (imaging, accessLevel) => {
  let removedLinks = 0;
  let createdLinks = 0;
  const existingDiagnoses = await getDiagnosisByImagingIdService(
    imaging.imagingId,
    accessLevel
  );
  const newDiagnoses = imaging.diagnoses;

  newDiagnoses.map(async (newDiagnosis) => {
    const isInList = existingDiagnoses.some(
      (diagnosis) => diagnosis.id === newDiagnosis.value.id
    );
    if (!isInList) {
      createdLinks++;
      await createDiagnosisImagingService({
        diagnosisId: newDiagnosis.value.id,
        imagingId: imaging.imagingId,
        patientId: imaging.patientId,
      });
    }
  });

  existingDiagnoses.map(async (existingDiagnosis) => {
    const notInList = !newDiagnoses.some(
      (diagnosis) => diagnosis.value.id === existingDiagnosis.id
    );
    if (notInList) {
      removedLinks++;
      await removeImagingDiagnosisService({
        diagnosisId: existingDiagnosis.id,
        imagingId: imaging.imagingId,
      });
    }
  });
  return { createdLinks, removedLinks };
};

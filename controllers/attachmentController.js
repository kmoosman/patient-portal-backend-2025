import {
  fileUploadService,
  createAttachmentService,
  linkAttachmentToDiagnosisService,
  linkAttachmentToProviderService,
  linkAttachmentToInstitutionService,
  linkAttachmentToInterventionService,
  linkAttachmentToImagingService,
  linkAttachmentToMedicationService,
  getAttachmentService,
} from "../services/attachmentService.js";
import clerkClient from "@clerk/clerk-sdk-node";
import { isUserAdminService } from "../services/userService.js";
import { createTimelineEventLinkService } from "../services/patientService.js";

//create attachment
export const createAttachment = async (req, res) => {
  const patientId = req.patientId;
  const user = await clerkClient.users.getUser(req.auth.userId);
  const userEmail = user.emailAddresses[0].emailAddress;
  const accessLevel = req.accessLevel;
  const isAdmin = await isUserAdminService(userEmail);
  const file = req.file;
  const data = req.body;

  if (!isAdmin) {
    return res.status(403).json({
      error: "You do not have permission to add an attachment for this user",
    });
  }

  try {
    let urlToSave = null;
    if (!data.link) {
      //process the file and upload it to S3
      const fileType = data.category === "video" ? "video" : "default";
      const url = await fileUploadService(file, fileType);
      urlToSave = url;
    }

    //add the file to the attachments table
    const fileUpload = await createAttachmentService(
      urlToSave,
      patientId,
      data
    );

    if (data.type === "timeline" && data.timelineId) {
      const link = {
        title: data.title,
        category: data.category,
        startDate: data.startDate,
        notes: data.notes,
        highlight: data.highlight,
        link: fileUpload.link,
      };
      await createTimelineEventLinkService({ id: data.timelineId, link: link });
    }
    const diagnosesToLink =
      typeof data.diagnoses === "string" && data.diagnoses != "undefined"
        ? JSON.parse(data.diagnoses)
        : [];
    //if there are diagnoses to link, link them
    if (diagnosesToLink.length > 0) {
      diagnosesToLink.forEach(async (diagnosis) => {
        await linkAttachmentToDiagnosisService(
          fileUpload.id,
          diagnosis.value,
          patientId
        );
      });
    }

    const providersToLink =
      typeof data.providers === "string" && data.providers != "undefined"
        ? JSON.parse(data.providers)
        : [];
    //if there are providers to link, link them
    if (providersToLink.length > 0) {
      providersToLink.forEach(async (provider) => {
        await linkAttachmentToProviderService(
          fileUpload.id,
          provider.value,
          patientId
        );
      });
    }

    const institutionsToLink =
      typeof data.institutions === "string" && data.institutions != "undefined"
        ? JSON.parse(data.institutions)
        : [];
    //if there are institutions to link, link them
    if (institutionsToLink.length > 0) {
      institutionsToLink.forEach(async (institution) => {
        await linkAttachmentToInstitutionService(
          fileUpload.id,
          institution.value,
          patientId
        );
      });
    }
    const interventionsToLink =
      typeof data.interventions === "string" &&
      data.interventions != "undefined"
        ? JSON.parse(data.interventions)
        : [];
    //if there are interventions to link, link them
    if (interventionsToLink.length > 0) {
      interventionsToLink.forEach(async (intervention) => {
        await linkAttachmentToInterventionService(
          fileUpload.id,
          intervention.value,
          patientId
        );
      });
    }

    const imagingToLink =
      typeof data.imaging === "string" && data.imaging != "undefined"
        ? JSON.parse(data.imaging)
        : [];
    //if there are imaging to link, link them
    if (imagingToLink.length > 0) {
      imagingToLink.forEach(async (imaging) => {
        await linkAttachmentToImagingService(
          fileUpload.id,
          imaging.value,
          patientId
        );
      });
    }

    const medicationsToLink =
      typeof data.medications === "string" && data.medications != "undefined"
        ? JSON.parse(data.medications)
        : [];
    //if there are medications to link, link them
    if (medicationsToLink.length > 0) {
      medicationsToLink.forEach(async (medication) => {
        await linkAttachmentToMedicationService(
          fileUpload.id,
          medication.value,
          patientId
        );
      });
    }
    res.json(fileUpload);
  } catch (err) {
    res.status(500).json({ error: "Failed to create attachment." });
  }
};

export const getAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await getAttachmentService(id);
    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

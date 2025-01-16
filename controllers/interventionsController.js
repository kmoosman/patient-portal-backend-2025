import e from "express";
import {
  getAllInterventionsByPatientService,
  getInterventionByIdService,
  getAllInterventionsByDiagnosisService,
  getAllAttachmentsForInterventionByIdService,
  createInterventionService,
  createInterventionProviderService,
  removeInterventionProviderService,
  getInterventionProvidersService,
  updateInterventionService,
} from "../services/interventionsService.js";
import clerkClient from "@clerk/clerk-sdk-node";
import { isUserAdminService } from "../services/userService.js";
import {
  getProviderByProviderIdService,
  getProviderByIdBasicService,
} from "../services/providerService.js";
import { getPresignedUrlService } from "../services/attachmentService.js";
import { processAttachmentLink } from "../helpers/utils.js";

export const getAllInterventionsByPatient = async (req, res) => {
  const lastLogin = req.query.lastLogin;
  const accessLevel = req.accessLevel;
  try {
    const patientId = req.patientId;
    const interventions = await getAllInterventionsByPatientService({
      id: patientId,
      lastLogin,
      accessLevel,
    });

    if (interventions) {
      res.json(interventions);
    } else {
      res.status(404).json({ error: "Interventions not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interventions." });
  }
};

export const getInterventionById = async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const interventions = await getInterventionByIdService({ id, accessLevel });

    if (interventions) {
      res.json(interventions);
    } else {
      res.status(404).json({ error: "Interventions not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interventions." });
  }
};

export const getAllInterventionsByDiagnosis = async (req, res) => {
  const id = req.params.id;
  try {
    const accessLevel = req.accessLevel;
    const interventions = await getAllInterventionsByDiagnosisService({
      id,
      accessLevel,
    });
    if (interventions) {
      res.json(interventions);
    } else {
      res.status(404).json({ error: "Interventions not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interventions." });
  }
};

export const getAllAttachmentsForInterventionById = async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const attachments = await getAllAttachmentsForInterventionByIdService({
      id,
      accessLevel,
    });

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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attachments." });
  }
};

export const createIntervention = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin (Todo: refactor this into a function)
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res.status(403).json({
        error:
          "You do not have permission to add an intervention for this user",
      });
    }

    const intervention = req.body.data.data;
    //todo: refactor this
    const patientIntervention = {
      patientId: patientId,
      interventionId: intervention?.id ?? null,
      title: intervention.title || null,
      institutionId: intervention.institution.institutionId || null,
      accessLevelId: intervention.accessLevelId || 5,
      providers: intervention.providers || [],
      notes: intervention.notes || null,
      listOrder: intervention.listOrder || 0,
      daysAdmitted: intervention.daysAdmitted || 0,
      startDate: intervention.startDate || new Date().toISOString(),
      endDate: intervention.endDate || null,
      result: intervention.result || null,
      category: intervention.category || null,
      reason: intervention.reason || null,
      diagnosisId: intervention.diagnosis.id || null,
      metadata: {
        organs: intervention.organs || [],
      },
    };

    const createdIntervention = await createInterventionService(
      patientIntervention
    );

    //link any listed providers to the intervention
    patientIntervention.providers.map(async (provider) => {
      const existingProvider = await getProviderByProviderIdService({
        providerId: provider.id,
        patientId,
        accessLevel,
      });
      if (existingProvider.length > 0) {
        createInterventionProviderService({
          providerId: existingProvider[0].providerId,
          interventionId: createdIntervention[0].id,
          patientId: patientId,
        });
      }
    });

    if (createdIntervention) {
      res.json(intervention.id);
    } else {
      res.status(404).json({ error: "Unable to create intervention" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create intervention." });
  }
};

//update intervention links
export const updateInterventionLinks = async (intervention, accessLevel) => {
  const patientId = intervention.patientId;
  let removedLinks = 0;
  let createdLinks = 0;

  try {
    const patientIntervention = {
      patientId: intervention.patientId,
      interventionId: intervention.id,
      providers: intervention.providers || [],
      attachments: intervention.attachments || [],
    };

    const existingInterventionProviders = await getInterventionProvidersService(
      {
        interventionId: patientIntervention.interventionId,
        patientId: patientId,
      }
    );
    //link any listed providers to the intervention
    patientIntervention.providers.map(async (provider) => {
      const existingProvider = await getProviderByIdBasicService({
        providerId: provider.id,
        patientId,
      });
      // ensure that providers isn't already by getting a link of existing providers for the intervention
      const providerIsInList = existingInterventionProviders.some(
        (interventionProvider) => interventionProvider.id === provider.id
      );
      if (existingProvider.length > 0 && !providerIsInList) {
        createInterventionProviderService({
          providerId: provider.id,
          interventionId: patientIntervention.interventionId,
          patientId: patientId,
        });
        createdLinks++;
      }
    });

    //find all of the providers in the existing list that are not in the new list and remove them
    const providersToRemove = existingInterventionProviders.filter(
      (interventionProvider) =>
        !patientIntervention.providers.some(
          (provider) => provider.id === interventionProvider.id
        )
    );
    if (providersToRemove.length > 0) {
      providersToRemove.map(async (provider) => {
        removeInterventionProviderService({
          providerId: provider.id,
          interventionId: patientIntervention.interventionId,
          patientId,
        });
        removedLinks++;
      });
    }

    //get a list of all attachments for the intervention
    const existingAttachments =
      await getAllAttachmentsForInterventionByIdService({
        id: patientIntervention.interventionId,
        accessLevel: 5,
      });
    //link any listed attachments to the intervention
    // patientIntervention.attachments.map(async (attachment) => {
    //   const existingAttachment = await getAttachmentService({ attachmentId: attachment.id });
    //   // ensure that attachments isn't already linked by getting a link of existing attachments for the intervention
    //   const attachmentIsInList = existingAttachments.some((interventionAttachment) => interventionAttachment.id === attachment.id);
    //   if (!existingAttachment.length > 0 && !attachmentIsInList) {
    //     linkAttachmentToInterventionService({ attachmentId: existingAttachment[0].id, interventionId: patientIntervention.interventionId, patientId });
    //     createdLinks++;
    //   }
    // });

    //find all of the attachments in the existing list that are not in the new list and remove them
    const attachmentsToRemove = existingAttachments.filter(
      (interventionAttachment) =>
        !patientIntervention.attachments.some(
          (attachment) => attachment.id === interventionAttachment.id
        )
    );
    // if (attachmentsToRemove.length > 0) {
    //   attachmentsToRemove.map(async (attachment) => {
    //     removeAttachmentFromInterventionService({ attachmentId: attachment.id, interventionId: patientIntervention.interventionId, patientId });
    //     removedLinks++;
    //   });
    // }
    return { createdLinks, removedLinks };
  } catch (err) {
    console.log(err);
    //throw error
    throw new Error("Failed to update intervention links" + err);
  }
};

//edit intervention
export const editIntervention = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin (Todo: refactor this into a function)
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res.status(403).json({
        error:
          "You do not have permission to edit an intervention for this user",
      });
    }

    const intervention = req.body.data.data;
    const patientIntervention = {
      id: intervention.id,
      patientId: patientId,
      interventionId: intervention.interventionId,
      title: intervention.title || null,
      institutionId: intervention.institutionId || null,
      accessLevelId: intervention.accessLevelId || 5,
      providers: intervention.providers || [],
      notes: intervention.notes || null,
      listOrder: intervention.listOrder || 0,
      daysAdmitted: intervention.daysAdmitted || 0,
      startDate: intervention.startDate || new Date().toISOString(),
      endDate: intervention.endDate || null,
      result: intervention.result || null,
      category: intervention.category || null,
      reason: intervention.reason || null,
      diagnosisId: intervention.diagnosisId || null,
      metadata: {
        organs: intervention.organs || [],
      },
    };

    const updatedInterventionDetails = await updateInterventionService(
      patientIntervention
    );

    if (updatedInterventionDetails) {
      //update the links for the intervention
      const updatedLinks = await updateInterventionLinks(
        patientIntervention,
        accessLevel
      );
      res.json({
        createdLinks: updatedLinks.createdLinks,
        removedLinks: updatedLinks.removedLinks,
        intervention: intervention.id,
      });
    } else {
      res.status(404).json({ error: "Unable to update intervention" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update intervention." });
  }
};

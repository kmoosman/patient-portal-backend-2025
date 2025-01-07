import {
  getAllDiagnosesForPatientService,
  getDiagnosisByIdWithInstitutionService,
  getAllDiagnosesForPatientFromProviderService,
  getAllProvidersForDiagnosisService,
  getAllAttachmentsForDiagnosisByIdService,
  getAllDiagnosesForPatientFromInstitutionService,
  createDiagnosisService,
  createCancerTypeService,
  createCancerSubtypeService,
  getCancerTypeByTypeService,
  getCancerSubtypeByTitle,
  getAllCancerTypesService,
  getAllCancerSubtypesByCancerTypeService,
  linkDiagnosisToProviderService,
  linkDiagnosisToInstitutionService,
  updateDiagnosisService,
  getAllInstitutionsForDiagnosisService,
  removeDiagnosisProviderLinkService,
  removeDiagnosisInstitutionLinkService

} from "../services/diagnosisService.js";
import { toNumberOrNull } from "../helpers/utils.js";
import { isUserAdminService } from "../services/userService.js";
import { clerkClient } from "@clerk/clerk-sdk-node";


export const getAllDiagnosesForPatient = async (req, res) => {
  try {
    const id = req.patientId;
    const lastLogin = req.query.lastLogin;
    const accessLevel = req.accessLevel;
    const diagnoses = await getAllDiagnosesForPatientService({ id, lastLogin, accessLevel });
    if (diagnoses) {
      res.json(diagnoses);
    } else {
      res.status(404).json({ error: "Diagnoses not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Diagnoses." });
  }
};

export const getAllDiagnosesForPatientFromProvider = async (req, res) => {
  try {
    const patientId = req.patientId;
    const providerId = req.params.id;
    const accessLevel = req.accessLevel;
    const diagnoses = await getAllDiagnosesForPatientFromProviderService(providerId, accessLevel, patientId);
    if (diagnoses) {
      res.json(diagnoses);
    } else {
      res.status(404).json({ error: "Diagnoses not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Diagnoses." });
  }
};

export const getAllDiagnosesForPatientFromInstitution = async (req, res) => {
  try {
    const institutionId = req.params.id;
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const diagnoses = await getAllDiagnosesForPatientFromInstitutionService(institutionId, accessLevel, patientId);
    if (diagnoses) {
      res.json(diagnoses);
    } else {
      res.status(404).json({ error: "Diagnoses not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Diagnoses." });
  }
};

export const getAllProvidersForDiagnosis = async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const providers = await getAllProvidersForDiagnosisService({ id, accessLevel });
    if (providers) {
      res.json(providers);
    } else {
      res.status(404).json({ error: "Providers not found." });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to fetch Providers." });
  }
};

export const getDiagnosisById = async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const diagnosis = await getDiagnosisByIdWithInstitutionService({ id, accessLevel });
    if (diagnosis) {
      res.json(diagnosis);
    } else {
      res.status(404).json({ error: "Diagnoses not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Diagnoses." });
  }
};

export const getAllAttachmentsForDiagnosisById = async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const attachments = await getAllAttachmentsForDiagnosisByIdService({ id, accessLevel });
    if (attachments) {
      res.json(attachments);
    } else {
      res.status(404).json({ error: "Attachments not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachments." });
  }
};

//get all cancer types
export const getAllCancerTypes = async (req, res) => {
  try {
    const cancerTypes = await getAllCancerTypesService();
    if (cancerTypes) {
      res.json(cancerTypes);
    } else {
      res.status(404).json({ error: "Cancer types not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cancer types." });
  }
}

export const getAllCancerSubtypes = async (req, res) => {
  try {
    const id = req.params.id;
    const cancerSubtypes = await getAllCancerSubtypesByCancerTypeService(id);
    if (cancerSubtypes) {
      res.json(cancerSubtypes);
    } else {
      res.status(404).json({ error: "Cancer subtypes not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cancer subtypes." });
  }
}


//create a new diagnosis 
export const createDiagnosis = async (req, res) => {
  try {
    const patientId = req.patientId;
    const diagnosis = req.body.data.data;
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to add imaging for this user" });
    }
    const data = {
      startDate: diagnosis.startDate || null,
      title: diagnosis.title || null,
      category: diagnosis.category || null,
      type: diagnosis.cancerType?.title ?? null,
      subtype: diagnosis.subtype?.title ?? null,
      stage: diagnosis.stage ?? null,
      grade: diagnosis.grade ?? null,
      primarySize: toNumberOrNull(diagnosis.primarySize),
      currentSize: toNumberOrNull(diagnosis.currentSize),
      units: diagnosis.category === "cancer" ? 'cm' : null,
      status: diagnosis.status || null,
      diseaseState: diagnosis.diseaseStatus || null,
      notes: diagnosis.notes || null,
      endDate: diagnosis.endDate || null,
      validated: null,
      patientId: patientId,
      accessLevelId: 5,
      color: diagnosis.color || 'blue',
      attributes: {
        organs: diagnosis.organs || []
      },
      pubMedKeywords: diagnosis.pubMedKeywords ? diagnosis.pubMedKeywords.trim() : null,
      clinicalTrialsKeywords: diagnosis.clinicalTrialsKeywords ? diagnosis.clinicalTrialsKeywords.replace(/,\s+/g, ',').trim() : null,
      highlighted: diagnosis.highlighted || false
    };

    //check to see if the diagnosis is a cancer 
    if (diagnosis.category === "cancer") {
      const cancerType = diagnosis.cancerType || null
      const cancerSubtype = diagnosis.subtype || null
      if (cancerType) {
        const newDiagnosis = await createDiagnosisService({ data });

        //link the diagnosis to the providers 
        if (diagnosis.providers.length > 0) {
          const providersToLink = diagnosis.providers;
          providersToLink.forEach(async (provider) => {
            await linkDiagnosisToProviderService(newDiagnosis.id, provider.id, patientId);
          });
        }

        //link the diagnosis to the institutions
        if (diagnosis.institutions.length > 0) {
          const institutionsToLink = diagnosis.institutions;
          institutionsToLink.forEach(async (institution) => {
            await linkDiagnosisToInstitutionService(newDiagnosis.id, institution.institutionId, patientId);
          });
        }

        if (newDiagnosis) {
          res.json(newDiagnosis);
        } else {
          res.status(404).json({ error: "Failed to create diagnosis." });
        }
        return;
      } else {
        //create a new cancer type and then create a diagnosis and link it to the new cancer type -- todo: come back and finish this later
        // const newCancer = await createCancerTypeService({ title: req.body.title });
        // //create a new subypte and link it to the new cancer type
        // const newCancerSubtype = await createCancerSubtypeService({ title: req.body.subtype, cancerTypeId: newCancer.id });
        // if (newCancer && newCancerSubtype) {
        //   const newDiagnosis = await createDiagnosisService({ ...req.body, type: newCancer.title, subtype: newCancerSubtype.title });
        //   if (newDiagnosis) {
        //     res.json(newDiagnosis);
        //   } else {
        //     res.status(404).json({ error: "Failed to create diagnosis." });
        //   }
        // } else {
        //   res.status(404).json({ error: "Failed to create cancer." });
        // }
        res.status(404).json({ error: "Failed to create diagnosis - cancer doesn't exist." });
        return;
      }
    }
    const newDiagnosis = await createDiagnosisService({ data });
    //link the diagnosis to the providers 
    if (diagnosis.providers.length > 0) {
      const providersToLink = diagnosis.providers;
      providersToLink.forEach(async (provider) => {
        await linkDiagnosisToProviderService(newDiagnosis.id, provider.id, patientId);
      });
    }

    //link the diagnosis to the institutions
    if (diagnosis.institutions.length > 0) {
      const institutionsToLink = diagnosis.institutions;
      institutionsToLink.forEach(async (institution) => {
        await linkDiagnosisToInstitutionService(newDiagnosis.id, institution.institutionId, patientId);
      });
    }

    if (newDiagnosis) {
      res.json(newDiagnosis);
    } else {
      res.status(404).json({ error: "Failed to create diagnosis." });
    }
    return;
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create diagnosis." });
  }
};

//create new cancer 
export const createCancer = async (req, res) => {

  //check if the cancer type exists in the cancers table or synonyms table
  const existingCancerType = await getCancerTypeByTypeService(req.body.title);
  if (existingCancerType) {
    //  return error with the name of the cancer type
    return res.status(404).json({ error: "Cancer type already exists.", cancerType: existingCancerType });
  }
  try {
    const newCancer = await createCancerTypeService(req.body);
    if (newCancer) {
      res.json(newCancer);
    } else {
      res.status(404).json({ error: "Failed to create cancer." });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create cancer." });
  }
};

//create new cancer subtype
export const createCancerSubtype = async (req, res) => {
  try {
    const existingSubtype = await getCancerSubtypeByTitle(req.body.title);
    if (existingSubtype) {
      //  return error with the name of the cancer type
      return res.status(404).json({ error: "Cancer subtype already exists.", cancerSubtype: existingSubtype });
    }

    const newCancerSubtype = await createCancerSubtypeService(req.body);
    if (newCancerSubtype) {
      res.json(newCancerSubtype);
    } else {
      res.status(404).json({ error: "Failed to create cancer subtype." });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create cancer subtype." });
  }
};

export const updateDiagnosis = async (req, res) => {

  try {

    const patientId = req.patientId;
    const id = req.params.id;
    const accessLevel = req.accessLevel;
    const diagnosis = req.body.data;
    const user = await clerkClient.users.getUser(req.auth.userId);

    const userEmail = user.emailAddresses[0].emailAddress;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to add imaging for this user" });
    }
    const data = {
      id: id,
      startDate: diagnosis.startDate || null,
      title: diagnosis.title || null,
      category: diagnosis.category || null,
      type: diagnosis.cancerType?.title ?? diagnosis.cancerType ?? null,
      subtype: diagnosis.subtype ?? null,
      stage: diagnosis.stage ?? null,
      grade: diagnosis.grade ?? null,
      primarySize: toNumberOrNull(diagnosis.primarySize),
      currentSize: toNumberOrNull(diagnosis.currentSize),
      units: diagnosis.category === "cancer" ? 'cm' : null,
      status: diagnosis.status || null,
      diseaseState: diagnosis.diseaseStatus || null,
      notes: diagnosis.notes || null,
      endDate: diagnosis.endDate || null,
      validated: null,
      patientId: patientId,
      accessLevelId: 5,
      color: diagnosis.color || 'blue',
      attributes: {
        organs: diagnosis?.organs || []
      },
      pubMedKeywords: diagnosis.pubMedKeywords ? diagnosis.pubMedKeywords.trim() : null,
      clinicalTrialsKeywords: diagnosis.clinicalTrialsKeywords ? diagnosis.clinicalTrialsKeywords.replace(/,\s+/g, ',').trim() : null,
      highlighted: diagnosis.highlighted || false
    };

    const updatedDiagnosis = await updateDiagnosisService({ data });
    const existingProviders = await getAllProvidersForDiagnosisService({ id: updatedDiagnosis.id, accessLevel });
    const existingInstitutions = await getAllInstitutionsForDiagnosisService({ id: updatedDiagnosis.id, accessLevel });
    const providersToRemove = existingProviders.filter((provider) => !diagnosis.providers.some((newProvider) => newProvider.id === provider.id));
    //link the diagnosis to the providers
    diagnosis.providers.map(async (newProvider) => {
      const providerIsInList = existingProviders.some((provider) => provider.id === newProvider.id);
      if (!providerIsInList) {
        await linkDiagnosisToProviderService(data.id, newProvider.id, patientId);
      }
    });
    //link the diagnosis to the institutions
    diagnosis.institutions.map(async (newInstitution) => {
      const institutionIsInList = existingInstitutions.some((institution) => institution.id === newInstitution.institutionId);
      if (!institutionIsInList) {
        await linkDiagnosisToInstitutionService(newInstitution.institutionId, data.id, patientId);
      }
    });

    //find all of the providers in the existing list that are not in the new list and remove them
    if (providersToRemove.length > 0) {
      providersToRemove.map(async (provider) => {
        await removeDiagnosisProviderLinkService({ providerId: provider.id, diagnosisId: data.id });
      });
    }

    //find all of the institutions in the existing list that are not in the new list and remove them
    const institutionsToRemove = existingInstitutions.filter((institution) => !diagnosis.institutions.some((newInstitution) => newInstitution.id === institution.id));
    if (institutionsToRemove.length > 0) {
      institutionsToRemove.map(async (institution) => {
        await removeDiagnosisInstitutionLinkService({ institutionId: institution.id, diagnosisId: data.id });
      });
    }

    if (updatedDiagnosis) {
      res.json(updatedDiagnosis);
    } else {
      res.status(404).json({ error: "Failed to update diagnosis." });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to update diagnosis." });
  }
};

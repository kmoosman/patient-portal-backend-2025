import {
  getAllProvidersService,
  getProviderByProviderIdService,
  getAllPatientDiagnosisForProviders,
  getAllPatientInstitutions,
  searchForExistingProviderByNPI,
  createPatientProviderService,
  createProviderDiagnosis,
  createProviderService,
  createProviderInstitution,
  updatePatientProviderService,
  removeProviderDiagnosisService,
  getProviderInstitutionService
} from "../services/providerService.js";
import { getDiagnosisByIdService, getDiagnosisByProviderService } from "../services/diagnosisService.js";
import axios from "axios";
import clerkClient from "@clerk/clerk-sdk-node";
import { isUserAdminService } from "../services/userService.js";
import { createPatientInstitutionDiagnosisService, getInstitutionByIdService, getInstitutionDiagnosisByService } from "../services/institutionService.js";


// Get all providers for a specific patient
export const getAllProvidersForPatient = async (req, res) => {
  try {
    const id = req.patientId;
    const lastLogin = req.query.lastLogin;
    const accessLevel = req.accessLevel;
    const providers = await getAllProvidersService({ id, lastLogin, accessLevel });
    const institutuions = await getAllPatientInstitutions({ id, accessLevel });
    const diagnoses = await getAllPatientDiagnosisForProviders({ id, accessLevel });
    if (providers) {
      providers.map((provider) => {
        provider.institutions = [];
        provider.diagnoses = [];
        institutuions.map((institution) => {
          if (provider.providerId === institution.providerId) {
            provider.institutions.push(institution);
          }
        });
        diagnoses.map((diagnosis) => {
          if (provider.providerId === diagnosis.providerId) {
            provider.diagnoses.push(diagnosis);
          }
        });
      });
      res.json(providers);
    } else {
      res.status(404).json({ error: "Providers not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
};

// Get providers by provider id
export const getProviderByProviderId = async (req, res) => {

  try {
    const providerId = req.params.id;
    const patientId = req.patientId;
    const accessLevel = req.accessLevel;
    const provider = await getProviderByProviderIdService({
      providerId,
      patientId,
      accessLevel
    });
    if (provider && provider.length > 0) {
      //make sure institutions are unique and not duplicated
      const uniqueInstitutions = [...new Map(provider[0].institutions.map(item => [item["id"], item])).values()];
      provider.institutions = uniqueInstitutions;
      res.json(provider[0]);
    } else {
      res.status(404).json({ error: "Provider not found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch provider." });
  }
};


// todo: need to come back to this to ensure we're handling the proxy correctly and needs to be moved to service
export const getAllProvidersNPI = async (req, res) => {
  req.url = req.url.replace('/npi', '');
  const url = `https://npiregistry.cms.hhs.gov/api${req.url}`;
  try {
    const response = await axios.get(url, { params: req.query });
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching data from NPI Registry.');
  }
};


export const createProvider = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin (Todo: refactor this into a function)
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to add providers for this user" });
    }

    const provider = req.body.data;
    //todo: refactor this 
    const patientProvider = {
      patientId: patientId,
      providerId: provider?.id ?? null,
      selectedProvider: provider.selectedProvider || null,
      institution: provider.institution || null,
      accessLevelId: provider.accessLevelId || 5,
      firstName: provider.providerFirstName.charAt(0).toUpperCase() + provider.providerFirstName.slice(1) || null,
      lastName: provider.providerLastName.charAt(0).toUpperCase() + provider.providerLastName.slice(1) || null,
      middleInitial: provider.providerMiddleInitial || null,
      designation: provider.providerDesignation || null,
      npi: provider.selectedProvider.number || null,
      specialization: provider.specialization || null,
      sub_specialization: provider.sub_specialization || null,
      notes: provider.notes || null,
      listOrder: provider.listOrder || 0,
      startDate: provider.startDate || new Date().toISOString(),
      endDate: provider.endDate || null,
      status: provider.status || "active",
      address_1: provider.address_1 || null,
      address_2: provider.address_2 || null,
      city: provider.city || null,
      state: provider.state || null,
      postal: provider.postal || null,
      country: provider.country || null,
      image: provider.image || null,
      link: provider.link || null,
      role: provider.role || null,
      title: provider.title || null,
      email: provider.email || null,
      fax: provider.fax || null,
      cell: provider.cell || null,
      phone: provider.phone || null,
      nursesLine: provider.nursesLine || null,
      afterHours: provider.afterHours || null,
      internalNotes: provider.internalNotes || null,
      primaryContact: provider.primaryContact || false,
      diagnoses: provider.diagnoses || [],
    };

    //this can be swapped for the frontend to pass the ID of the provider and to do a lookup on the ID
    const existingProvider = await searchForExistingProviderByNPI(patientProvider.npi);
    if (existingProvider.length > 0) {
      patientProvider.providerId = existingProvider[0].id;
      const createdPatientProvider = await createPatientProviderService(patientProvider);
      //if the provider has a linked institution, check to see if the institution is already linked to the provider
      if (patientProvider.institution) {
        const existingInstitution = await getInstitutionByIdService(patientProvider.institution.institutionId);
        if (existingInstitution.length < 1) {
          //link provider to institution
          createProviderInstitution({ providerId: existingProvider[0].id, institutionId: existingInstitution[0].id });
        }
      }

      //link provider to diagnosis
      patientProvider.diagnoses.map(async (diagnosis) => {
        const existingDiagnosis = await getDiagnosisByIdService({ id: diagnosis, accessLevel });
        if (existingDiagnosis.length > 0) {
          const linkedDiagnosisToProvider = await createProviderDiagnosis({ diagnosisId: existingDiagnosis[0].id, providerId: existingProvider[0].id, patientId: patientId });
          //link diagnosis to institution
          if (patientProvider.institution) {
            const existingInstitution = await getInstitutionByIdService(patientProvider.institution.institutionId);
            if (existingInstitution.length > 0) {
              //check if diagnosis is already linked to institution
              const isDiagnosisLinked = isDiagnosisExistsForInstitutionCheck({ institutionId: existingInstitution[0].id, diagnosisId: existingDiagnosis[0].id });
              //if not, link diagnosis to institution
              if (!isDiagnosisLinked) {
                createPatientInstitutionDiagnosisService({ diagnosisId: existingDiagnosis[0].id, institutionId: existingInstitution[0].id, patientId: patientId });
              }
              //link provider to institution
              createProviderInstitution({ providerId: existingProvider[0].id, institutionId: existingInstitution[0].id });
            }

          }
        }
      });

      if (createdPatientProvider) {
        res.json(provider.id);
      } else {
        res.status(404).json({ error: "Unable to create provider" });
      }
    } else {
      //todo: there is duplicated code here that could be refactored
      const createdProvider = await createProviderService(patientProvider);
      //if the provider has a linked institution, check to see if the institution is already linked to the provider
      if (patientProvider.institution) {
        const existingInstitution = await getInstitutionByIdService(patientProvider.institution.institutionId);
        if (existingInstitution.length < 1) {
          //link provider to institution
          createProviderInstitution({ providerId: existingProvider[0].id, institutionId: existingInstitution[0].id });
        }
      }
      // link newly created provider to patient
      patientProvider.providerId = createdProvider[0].id;
      const createdPatientProvider = await createPatientProviderService(patientProvider);

      //link provider to diagnosis
      provider.diagnoses.map(async (diagnosis) => {
        const existingDiagnosis = await getDiagnosisByIdService({ id: diagnosis, accessLevel });
        if (existingDiagnosis.length > 0) {
          const linkedDiagnosisToProvider = await createProviderDiagnosis({ diagnosisId: existingDiagnosis[0].id, providerId: createdProvider[0].id, patientId: patientId });

          //link diagnosis to institution
          if (patientProvider.institution) {
            const existingInstitution = await getInstitutionByIdService(patientProvider.institution.institutionId);
            if (existingInstitution.length > 0) {
              //check if diagnosis is already linked to institution
              const isDiagnosisLinked = await isDiagnosisExistsForInstitutionCheck({ institutionId: existingInstitution[0].id, diagnosisId: existingDiagnosis[0].id });
              //if not, link diagnosis to institution
              if (!isDiagnosisLinked) {
                createPatientInstitutionDiagnosisService({ diagnosisId: existingDiagnosis[0].id, institutionId: existingInstitution[0].id, patientId: patientId });
              }
            }
            //link provider to institution
            createProviderInstitution({ providerId: createdProvider[0].id, institutionId: existingInstitution[0].id });
          }

        }
      })
      if (createdPatientProvider) {
        res.json(provider.id);
      } else {
        res.status(404).json({ error: "Unable to create provider" });
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create provider." });
  }
}

export const isDiagnosisExistsForInstitutionCheck = async ({ institutionId, diagnosisId }) => {
  const institutionDiagnosis = await getInstitutionDiagnosisByService({ institutionId, diagnosisId });
  if (institutionDiagnosis.length > 0) {
    return true;
  }
  return false;
}

// Update provider
export const updateProvider = async (req, res) => {
  const patientId = req.patientId;

  try {
    // Fetch user details from Clerk then check if they are an admin (Todo: refactor this into a function)
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;
    const accessLevel = req.accessLevel;
    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to add providers for this user" });
    }

    const provider = req.body.payload;
    const patientProvider = {
      id: provider.id,
      patientId: patientId,
      providerId: provider.providerId,
      selectedProvider: provider.selectedProvider || null,
      institution: provider.institution || null,
      accessLevelId: provider.accessLevelId || 5,
      firstName: provider.providerFirstName.charAt(0).toUpperCase() + provider.providerFirstName.slice(1) || null,
      lastName: provider.providerLastName.charAt(0).toUpperCase() + provider.providerLastName.slice(1) || null,
      middleInitial: provider.providerMiddleInitial || null,
      designation: provider.providerDesignation || null,
      npi: provider.npi || null,
      specialization: provider.specialization || null,
      sub_specialization: provider.subSpecialization || null,
      notes: provider.notes || null,
      listOrder: provider.listOrder || 0,
      startDate: provider.startDate || new Date().toISOString(),
      endDate: provider.endDate || null,
      status: provider.status || "active",
      address_1: provider.address1 || null,
      address_2: provider.address2 || null,
      city: provider.city || null,
      state: provider.state || null,
      postal: provider.postal || null,
      country: provider.country || null,
      image: provider.image || null,
      link: provider.link || null,
      role: provider.role || null,
      title: provider.title || null,
      email: provider.email || null,
      fax: provider.fax || null,
      cell: provider.cell || null,
      phone: provider.phone || null,
      nursesLine: provider.nursesLine || null,
      afterHours: provider.afterHours || null,
      internalNotes: provider.internalNotes || null,
      primaryContact: provider.primaryContact || false,
      diagnoses: provider.diagnoses || [],
    };

    const updatedProvider = await updatePatientProviderService(patientProvider);
    if (updatedProvider) {
      //if the provider has a linked institution, check to see if the institution is already linked to the provider
      if (patientProvider.institution) {
        const existingInstitution = await getProviderInstitutionService({ providerId: patientProvider.providerId, institutionId: patientProvider.institution.institutionId });
        if (existingInstitution.length < 1) {
          //link provider to institution
          createProviderInstitution({ providerId: patientProvider.providerId, institutionId: patientProvider.institution.institutionId });
        }
      }
      //update the links for the intervention
      const updatedLinks = await updateProviderLinks(patientProvider, accessLevel);
      if (updatedLinks) {
        res.json({
          createdLinks: updatedLinks.createdLinks,
          removedLinks: updatedLinks.removedLinks,
          provider: patientProvider.imagingId
        });
        return;
      }
    } else {
      res.status(404).json({ error: "Unable to update provider" });
      return;
    }

    if (updatedProvider) {
      res.json(provider.id);
    } else {
      res.status(404).json({ error: "Unable to update provider" });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to update provider." });
  }
}

//update provider links
const updateProviderLinks = async (provider, accessLevel) => {
  let removedLinks = 0;
  let createdLinks = 0;
  const existingDiagnoses = await getDiagnosisByProviderService(provider.providerId, provider.patientId, accessLevel);
  const newDiagnoses = provider.diagnoses;

  await newDiagnoses.map(async (newDiagnosis) => {
    const isInList = existingDiagnoses.some(diagnosis => diagnosis.id === newDiagnosis.value.id);
    if (!isInList) {
      createdLinks++;
      await createProviderDiagnosis({ diagnosisId: newDiagnosis.value.id, providerId: provider.providerId, patientId: provider.patientId });
    }
  });

  await existingDiagnoses.map(async (existingDiagnosis) => {
    const notInList = !newDiagnoses.some(diagnosis => diagnosis.value.id === existingDiagnosis.id);
    if (notInList) {
      removedLinks++;
      await removeProviderDiagnosisService({ diagnosisId: existingDiagnosis.id, patientId: provider.patientId, providerId: provider.providerId });

    }
  })
  return { createdLinks, removedLinks };
}



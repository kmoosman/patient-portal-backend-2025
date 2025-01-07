import { getAllDiagnosesForPatientService } from "../services/diagnosisService.js";
import {
  getAllInstitutionsService,
  getAllInstitutionsByPatientService,
  getInstitutionByIdWithProvidersService,
  searchInstitutionByTitleService,
  createInstitutionService,
  createPatientInstitutionService,
  updatePatientInstitutionService,
  getAllDiagnosesByInstitutionService,
  linkPatientInstitutionDiagnosisService,
  unlinkPatientInstitutionDiagnosisService
} from "../services/institutionService.js";
import clerkClient from "@clerk/clerk-sdk-node";
import { isUserAdminService } from "../services/userService.js";

export const searchInstitutionByTitleController = async (req, res) => {
  const title = req.query.title;
  try {
    const institutions = await searchInstitutionByTitleService(title);
    if (institutions) {
      res.json(institutions);
    } else {
      res.status(404).json({ error: "Institutions not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch institutions." });
  }
};

export const getAllInstitutionsController = (req, res) => {
  const id = req.params.id;
  getAllInstitutionsService(id)
    .then((institutions) => {
      if (institutions) {
        res.json(institutions);
      } else {
        res.status(404).json({ error: "Institutions not found" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch institutions" });
    });
};

export const getAllInstitutionsByPatientController = (req, res) => {
  const patientId = req.patientId;
  const accessLevel = req.accessLevel;
  const lastLogin = req.query.lastLogin;
  getAllInstitutionsByPatientService(patientId, lastLogin, accessLevel)
    .then(async (institutions) => {
      const diagnoses = await getAllDiagnosesForPatientService({ id: patientId, lastLogin, accessLevel });
      if (institutions) {
        institutions.map(async (institution) => {
          institution.diagnoses = [];
          diagnoses.map((diagnosis) => {
            if (diagnosis.institutions.length > 0) {
              diagnosis.institutions.map((diagnosisInstitution) => {
                if (
                  diagnosisInstitution.institutionId ===
                  institution.institutionId
                ) {
                  institution.diagnoses.push({
                    id: diagnosis.id,
                    title: diagnosis.title,
                    category: diagnosis.category,
                    color: diagnosis.color,
                  });
                }
              });
            }
          });
        });
        res.json(institutions);
      } else {
        res.status(404).json({ error: "Institutions not found." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch institutions." });
    });
};


export const getInstitutionById = (req, res) => {
  const institutionId = req.params.id;
  const patientId = req.patientId;
  const accessLevel = req.accessLevel;
  getInstitutionByIdWithProvidersService(institutionId, accessLevel, patientId)
    .then(async (institution) => {
      const diagnoses = await getAllDiagnosesForPatientService({ id: patientId, accessLevel });
      if (institution && diagnoses) {
        institution.diagnoses = [];
        diagnoses.map((diagnosis) => {
          if (diagnosis.institutions.length > 0) {
            diagnosis.institutions.map((diagnosisInstitution) => {
              if (diagnosisInstitution.institutionId === institution.institutionId) {
                institution.diagnoses.push({
                  id: diagnosis.id,
                  title: diagnosis.title,
                  category: diagnosis.category,
                  type: diagnosis.type,
                });
              }
            });
          }
        });
        res.json(institution);
      } else {
        res.status(404).json({ error: "Institution not found." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch institution." });
    });
};


export const createPatientInstitution = async (req, res) => {
  const patientId = req.patientId;
  try {
    // Fetch user details from Clerk then check if they are an admin
    const user = await clerkClient.users.getUser(req.auth.userId);
    const userEmail = user.emailAddresses[0].emailAddress;

    const isAdmin = await isUserAdminService(userEmail);

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "You do not have permission to add institutions for this user" });
    }

    const institution = req.body.data.institution || req.body.data;
    //todo: refactor this 
    const patientInstitution = {
      patientId: patientId,
      institutionId: institution?.id ?? null,
      accessLevelId: 5,
      address1: institution.address1,
      address2: institution.address2,
      city: institution.city,
      state: institution.state,
      postal: institution.postal,
      country: institution.country,
      recordsOfficeEmail: req.body.data.recordsOfficeEmail || null,
      recordsOfficePhone: req.body.data.recordsOfficePhone || null,
      internalNotes: req.body.data.internalNotes,
      notes: req.body.data.notes,
      listOrder: req.body.data.listOrder,
      status: req.body.data.status || "active",
    }
    //this can be swapped for the frontend to pass the ID of the institution and to do a lookup on the ID
    const existingInstitution = await searchInstitutionByTitleService(institution.title);
    if (existingInstitution.length > 0) {
      patientInstitution.institutionId = existingInstitution[0].id;
      const createdPatientInstitution = await createPatientInstitutionService(patientInstitution);
      if (createdPatientInstitution) {
        res.json(institution.id);
      } else {
        res.status(404).json({ error: "Unable to create institution" });
      }
    } else {
      const createdInstitution = await createInstitutionService(institution);
      patientInstitution.institutionId = createdInstitution.id;
      const createdPatientInstitution = await createPatientInstitutionService(patientInstitution);
      if (createdPatientInstitution) {
        res.json(institution.id);
      } else {
        res.status(404).json({ error: "Unable to create institution" });
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to create institution." });
  }
}

//update institutions 
export const updatePatientInstitution = async (req, res) => {

  const patientId = req.patientId;
  const accessLevel = req.accessLevel;
  const institution = req.body.data;

  try {
    const diagnoses = institution.diagnoses.map((diagnosis) => {
      return diagnosis.value;
    });
    const institutionId = institution.institutionId;

    const updatedInstitution = await updatePatientInstitutionService(institutionId, institution, patientId, accessLevel);

    //check to see which diagnoses are linked to the institution
    const linkedDiagnoses = await getAllDiagnosesByInstitutionService(institutionId, patientId, accessLevel);
    //check to see if the diagnosis sent are already linked to the institution
    const diagnosesToLink = diagnoses.filter((diagnosis) => {
      return !linkedDiagnoses.some((d) => d.diagnosisId === diagnosis.id);
    });

    //find the diagnosis that should be removed
    const diagnosesToRemove = linkedDiagnoses.filter((diagnosis) => {
      return !diagnoses.some((d) => d.id === diagnosis.diagnosisId);
    })

    //link the diagnoses to the institution
    if (diagnosesToLink.length > 0) {
      diagnosesToLink.forEach(async (diagnosis) => {
        await linkPatientInstitutionDiagnosisService({ diagnosisId: diagnosis.id, institutionId, patientId });
      });
    }

    //remove the diagnoses from the institution
    if (diagnosesToRemove.length > 0) {
      diagnosesToRemove.forEach(async (diagnosis) => {
        await unlinkPatientInstitutionDiagnosisService({ diagnosisId: diagnosis.diagnosisId, institutionId, patientId });
      });
    }

    if (updatedInstitution) {
      res.json(updatedInstitution);
    } else {
      res.status(404).json({ error: "Unable to update institution" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update institution" });
  }
};



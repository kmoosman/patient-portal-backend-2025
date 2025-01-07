import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllInstitutionsService = async () => {
  try {
    const query = `SELECT * FROM institutions`;
    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results;
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch institutions");
  }
};

export const getInstitutionDiagnosisByService = async ({ institutionId, diagnosisId }) => {
  try {
    const query = `SELECT * FROM patient_institution_diagnosis WHERE institution_id = :institutionId AND diagnosis_id = :diagnosisId;`;
    const results = await sequelize.query
      (query, {
        replacements: { institutionId, diagnosisId },
        type: sequelize.QueryTypes.SELECT,
      });
    const institutionDiagnosis = results;
    if (institutionDiagnosis) {
      return deepCamelcaseKeys(institutionDiagnosis);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch institution diagnosis");
  }
};

export const getAllInstitutionsByPatientService = async (id, lastLogin, accessLevel) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND pt.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `SELECT
    i.*,
    pt.institution_id,
    pt.*,
    COALESCE(json_agg(
        json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        ) ORDER BY p.id
    ) FILTER (WHERE p.id IS NOT NULL), '[]') AS providers
FROM
    institutions i
INNER JOIN
    patient_institutions pt ON i.id = pt.institution_id
LEFT JOIN
    provider_institution pi ON i.id = pi.institution_id
LEFT JOIN
    patient_providers pp ON pt.patient_id = pp.patient_id AND pi.provider_id = pp.provider_id
LEFT JOIN
    providers p ON pp.provider_id = p.id
WHERE
    pt.patient_id = :id
    AND pt.access_level_id >= :accessLevel
    ${additionalCondition}
GROUP BY
    i.id, pt.id;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const institutions = results;
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch institutions");
  }
};

export const getInstitutionByIdWithProvidersService = async (
  institutionId,
  accessLevel,
  patientId,
) => {
  let replacements = { institutionId, accessLevel, patientId };
  try {
    const query = ` 
SELECT
    i.*,
    pi.*,
    pi.status,
    json_agg(
        json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        )
    ) AS providers
    FROM
  institutions i
    INNER JOIN
    patient_institutions pi ON i.id = pi.institution_id
    LEFT JOIN
    provider_institution pi2 ON i.id = pi2.institution_id
    LEFT JOIN
    providers p ON pi2.provider_id = p.id
      WHERE
      pi.patient_id = :patientId
      AND i.id = :institutionId
      AND pi.access_level_id >= :accessLevel
      GROUP BY
      i.id,pi.id,pi.status;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results[0];
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch institutions");
  }
};

export const getInstitutionByIdService = async (id) => {
  try {
    const query = `SELECT * FROM institutions WHERE id = :id`;
    const results = await
      sequelize
        .query(query, {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT,
        });
    if (results) {
      return deepCamelcaseKeys(results);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch institution");
  }
};

export const searchInstitutionByTitleService = async (title) => {
  try {
    const query = `SELECT * FROM institutions WHERE title ILIKE :title LIMIT 10;`;
    const results = await sequelize.query(query, {
      replacements: { title: `%${title}%` },
      type: sequelize.QueryTypes.SELECT,
    });
    if (results) {
      return deepCamelcaseKeys(results);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch institutions");
  }
};


export const createInstitutionService = async (institution) => {
  const institutionId = uuidv4();

  const replacements = {
    id: institutionId,
    title: institution.title,
    address1: institution.address1,
    address2: institution.address2,
    city: institution.city,
    state: institution.state,
    postal: institution.postal,
    country: institution.country,
  };

  try {
    const query = `INSERT INTO institutions (id, title, address_1, address_2, city, state, postal_code, country, created_at)
    VALUES (:id, :title, :address1, :address2, :city, :state, :postal, :country, NOW()) RETURNING *;
    `;
    const result = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    return deepCamelcaseKeys(result[0][0]);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create institution");
  }
}

export const createPatientInstitutionService = async (patientInstitution) => {
  const patientInstitutionId = uuidv4();
  const patientId = patientInstitution.patientId;
  const institutionId = patientInstitution.institutionId;
  let replacements = {
    patientInstitutionId: patientInstitutionId,
    patientId: patientId,
    institutionId: institutionId,
    accessLevelId: 5,
    recordsOfficeEmail: patientInstitution.recordsOfficeEmail ?? null,
    recordsOfficePhone: patientInstitution.recordsOfficePhone ?? null,
    internalNotes: patientInstitution.internalNotes ?? null,
    notes: patientInstitution.notes ?? null,
    listOrder: patientInstitution.listOrder ?? null,
    status: patientInstitution.status ?? null,
  }
  try {
    const query = `INSERT INTO patient_institutions (id, patient_id, institution_id, access_level_id, records_office_email, records_office_phone, internal_notes, notes, list_order, status, created_at)
    VALUES (:patientInstitutionId, :patientId, :institutionId, :accessLevelId, :recordsOfficeEmail, :recordsOfficePhone, :internalNotes, :notes, :listOrder, :status, NOW());
    `;
    const result = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    return deepCamelcaseKeys(result);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create patient institution");
  }
}

export const createPatientInstitutionDiagnosisService = async ({ diagnosisId, institutionId, patientId }) => {
  try {
    const query = `INSERT INTO patient_institution_diagnosis (patient_id, institution_id, diagnosis_id)
    VALUES (:patientId, :institutionId, :diagnosisId) RETURNING *;`;
    const result = await sequelize.query(query, {
      replacements: { patientId, institutionId, diagnosisId },
      type: sequelize.QueryTypes.INSERT,
    });
    if (result) {
      return deepCamelcaseKeys(result);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create patient institution diagnosis");
  }
}

//update patient institutuion
export const updatePatientInstitutionService = async (institutionId, institution, patientId) => {
  try {
    const query = `UPDATE patient_institutions SET records_office_email = :recordsOfficeEmail, records_office_phone = :recordsOfficePhone, internal_notes = :internalNotes, notes = :notes, list_order = :listOrder, status = :status WHERE institution_id = :institutionId AND patient_id = :patientId;`;
    const result = await sequelize.query(query, {
      replacements: { institutionId, ...institution, patientId },
      type: sequelize.QueryTypes.UPDATE,
    });
    if (result) {
      return deepCamelcaseKeys(result);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update institution");
  }
}

//link a diagnosis to an institution
export const linkPatientInstitutionDiagnosisService = async ({ diagnosisId, institutionId, patientId }) => {
  try {
    const query = `INSERT INTO patient_institution_diagnosis (diagnosis_id, institution_id, patient_id) VALUES (:diagnosisId, :institutionId, :patientId);`;
    const result = await sequelize.query(query, {
      replacements: { diagnosisId, institutionId, patientId },
      type: sequelize.QueryTypes.INSERT,
    });
    if (result) {
      return deepCamelcaseKeys(result);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to link patient institution diagnosis");
  }
}

//unlink a diagnosis from an institution
export const unlinkPatientInstitutionDiagnosisService = async ({ diagnosisId, institutionId, patientId }) => {
  try {
    const query = `DELETE FROM patient_institution_diagnosis WHERE diagnosis_id = :diagnosisId AND institution_id = :institutionId AND patient_id = :patientId;`;
    const result = await sequelize.query(query, {
      replacements: { diagnosisId, institutionId, patientId },
      type: sequelize.QueryTypes.DELETE,
    });
    if (result) {
      return deepCamelcaseKeys(result);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to unlink patient institution diagnosis");
  }
}

//get all diagnoses linked to an institution
export const getAllDiagnosesByInstitutionService = async (institutionId, patientId) => {
  try {
    const query = `SELECT * FROM patient_institution_diagnosis WHERE institution_id = :institutionId AND patient_id = :patientId`;
    const results = await sequelize.query(query, {
      replacements: { institutionId, patientId },
      type: sequelize.QueryTypes.SELECT,
    });
    if (results) {
      return deepCamelcaseKeys(results);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
}
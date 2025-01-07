import { query } from "express";
import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllDiagnosesForPatientService = async ({ id, lastLogin, accessLevel }) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND pi.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `SELECT
    d.*,
    COALESCE(json_agg(
        json_build_object(
            'institution_id', i.id,
            'institution_name', i.title
        )
        ORDER BY i.id
    ) FILTER (WHERE i.id IS NOT NULL), '[]') AS institutions,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', dl.id,
            'title', dl.title,
            'link', dl.link,
            'category', dl.category,
            'description', dl.description,
            'notes', dl.notes
        )) FROM diagnoses_links dl
        WHERE dl.diagnosis_id = d.id),
        '[]'
    ) AS links
FROM
    diagnoses d
LEFT JOIN
    patient_institution_diagnosis pid ON d.id = pid.diagnosis_id
LEFT JOIN
    institutions i ON pid.institution_id = i.id
WHERE
    d.patient_id = :id 
    AND d.access_level_id >= :accessLevel
    ${additionalCondition}
GROUP BY
    d.id;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};

export const getAllDiagnosesForPatientFromProviderService = async (id, accessLevel, patientId) => {

  try {
    const query = `select d.*, pl.first_name, pl.last_name, pl.designation, pl.id as provider_id from diagnoses d
    inner join patient_provider_diagnosis ppd on d.id = ppd.diagnosis_Id
    inner join providers pl on ppd.provider_id = pl.id
    where pl.id = :id
    AND ppd.patient_id = :patientId
    AND d.access_level_id >= :accessLevel
    `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel, patientId: patientId },
      type: sequelize.QueryTypes.SELECT,
    });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};

export const getAllDiagnosesForPatientFromInstitutionService = async (id, accessLevel, patientId) => {
  try {
    const query = `select d.*, json_agg(json_build_object('institution_id', i.id, 'institution_name', i.title)) AS institutions from diagnoses d
    inner join patient_institution_diagnosis pid on d.id = pid.diagnosis_Id
    inner join institutions i on pid.institution_id = i.id
    where i.id = :id
    AND pid.patient_id = :patientId
    AND d.access_level_id >= :accessLevel
    group by i.id, d.id;`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel, patientId: patientId },
      type: sequelize.QueryTypes.SELECT,
    });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};

export const getAllProvidersForDiagnosisService = async ({ id, accessLevel }) => {
  const replacements = { id, accessLevel };
  try {
    const query = `select providers.*, pp.list_order, pp.role, pp.primary_contact from providers
    inner join patient_provider_diagnosis on providers.id = patient_provider_diagnosis.provider_id
    inner join patient_providers pp on providers.id = pp.provider_id
    where patient_provider_diagnosis.diagnosis_id = :id
    AND pp.access_level_id >= :accessLevel
    GROUP BY providers.id, pp.list_order, pp.role, pp.primary_contact;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};

export const getAllInstitutionsForDiagnosisService = async ({ id, accessLevel }) => {
  const replacements = { id, accessLevel };
  try {
    const query = `select institutions.*, pi.list_order from institutions
    inner join patient_institution_diagnosis on institutions.id = patient_institution_diagnosis.institution_id
    inner join patient_institutions pi on institutions.id = pi.institution_id
    where patient_institution_diagnosis.diagnosis_id = :id
    AND pi.access_level_id >= :accessLevel
    GROUP BY institutions.id, pi.list_order;`;
    const results = await sequelize.query
      (query, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT,
      });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};


export const getDiagnosisByIdWithInstitutionService = async ({ id, accessLevel }) => {
  const replacements = { id, accessLevel };
  try {
    const query = `SELECT
    d.*,
    dij.patient_id,
    COALESCE(
        json_agg(json_build_object('institution_id', i.id, 'institution_name', i.title)) FILTER (WHERE i.id IS NOT NULL),
        '[]'
    ) AS institutions,
    COALESCE(
      (SELECT json_agg(json_build_object('provider_id', p.id, 'first_name', p.first_name, 'last_name', p.last_name, 'designation', p.designation))
       FROM (
           SELECT DISTINCT ON (p.id) p.id, p.first_name, p.last_name, p.designation
           FROM providers p
           INNER JOIN patient_provider_diagnosis ppd ON ppd.provider_id = p.id
           WHERE ppd.diagnosis_id = d.id
       ) p),
      '[]'
  ) AS providers,
    COALESCE(
        (SELECT json_agg(row_to_json(t))
         FROM (
             SELECT pi.*,
             (SELECT json_agg(json_build_object('title', i.title, 'id', i.id))
              FROM institutions i
              WHERE i.id = pi.institution_id) AS institution
             FROM patient_imaging pi
             WHERE pi.patient_id = dij.patient_id AND pi.diagnosis_id = d.id
         ) t),
        '[]'
    ) AS scans,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', dl.id,
            'title', dl.title,
            'link', dl.link,
            'category', dl.category,
            'description', dl.description,
            'notes', dl.notes
        )) FROM diagnoses_links dl
        WHERE dl.diagnosis_id = d.id),
        '[]'
    ) AS links
FROM
    diagnoses d
LEFT JOIN
    patient_institution_diagnosis dij ON d.id = dij.diagnosis_id
LEFT JOIN
    institutions i ON dij.institution_id = i.id
LEFT JOIN
    patient_provider_diagnosis ppd ON d.id = ppd.diagnosis_id
LEFT JOIN
    providers p ON ppd.provider_id = p.id
WHERE
    d.id = :id
    AND d.access_level_id >= :accessLevel
GROUP BY
    d.id, dij.patient_id;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const diagnoses = results[0];
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    } else {
      throw new Error("Diagnosis not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};

//get just diagnosis by id
export const getDiagnosisByIdService = async ({ id, accessLevel }) => {
  const replacements = { id, accessLevel };
  try {
    const query = `SELECT * FROM diagnoses WHERE id = :id AND access_level_id >= :accessLevel`;
    const results = await sequelize.query
      (query, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT,
      });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    } else {
      throw new Error("Diagnosis not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};


export const getAllAttachmentsForDiagnosisByIdService = async ({ id, accessLevel }) => {
  const replacements = { id, accessLevel };
  try {
    const query = `SELECT
    a.*,
    COALESCE(
        json_agg(
            CASE
                WHEN i.id IS NOT NULL THEN json_build_object('institution_id', i.id, 'institution_name', i.title)
                ELSE NULL
            END
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
    ) AS institutions
FROM
    diagnoses_attachments
INNER JOIN
    attachments a ON diagnoses_attachments.attachment_id = a.id
LEFT JOIN
    institutions i ON a.institution_id = i.id
WHERE
    diagnoses_attachments.diagnosis_id = :id
    AND a.access_level_id >= :accessLevel
GROUP BY
    a.id;
`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};


export const createDiagnosisService = async ({ data }) => {
  const { startDate, title, category, type, subtype, attributes, status, diseaseState, notes, endDate, validated, patientId, accessLevelId, color, pubMedKeywords, clinicalTrialsKeywords, highlighted, units, stage, grade, primarySize, currentSize } = data;
  try {

    //if the category is cancer and the type is a type that exists in the cancer types table allow it to be created if not throw an error 
    if (category === "cancer") {
      const cancerType = await getCancerTypeByTypeService(type);
      if (!cancerType) {
        throw new Error("Cancer type not found, create a new cancer first");
      }
    }

    //generate uuid 
    const id = uuidv4();
    const organs = JSON.stringify(attributes);
    const query = `INSERT INTO diagnoses 
    (
      id,
      start_date,
      title,
      category,
      type,
      subtype,
      metadata,
      status,
      disease_status,
      notes,
      end_date,
      validated,
      patient_id,
      access_level_id,
      color,
      pub_med_keywords,
      clinical_trials_keywords,
      highlighted,
      size_units,
      stage,
      grade,
      primary_size,
      current_size) VALUES (:id, :startDate, :title, :category, :type, :subtype, :organs, :status, :diseaseState, :notes, :endDate, :validated, :patientId, :accessLevelId, :color, :pubMedKeywords, :clinicalTrialsKeywords, :highlighted, :units, :stage, :grade, :primarySize, :currentSize) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: { id, startDate, title, category, type, subtype, organs, status, diseaseState, notes, endDate, validated, patientId, accessLevelId, color, pubMedKeywords, clinicalTrialsKeywords, highlighted, units, stage, grade, primarySize, currentSize },
      type: sequelize.QueryTypes.INSERT,
    });
    const diagnoses = results[0][0];
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create diagnosis");
  }
};

export const linkDiagnosisToProviderService = async (diagnosisId, providerId, patientId) => {
  try {
    const query = `INSERT INTO patient_provider_diagnosis (patient_id, provider_id, diagnosis_id) VALUES (:patientId, :providerId, :diagnosisId) RETURNING *`;
    const result = await sequelize.query(query, {
      replacements: { patientId, providerId, diagnosisId },
      type: sequelize.QueryTypes.INSERT,
    });
    if (result) {
      return deepCamelcaseKeys(result);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to link diagnosis to provider");
  }
};

export const linkDiagnosisToInstitutionService = async (diagnosisId, institutionId, patientId) => {
  try {
    const query = `INSERT INTO patient_institution_diagnosis (patient_id, institution_id, diagnosis_id) VALUES (:patientId, :institutionId, :diagnosisId) RETURNING *`;
    const result = await sequelize.query(query, {
      replacements: { patientId, diagnosisId, institutionId },
      type: sequelize.QueryTypes.INSERT,
    });
    if (result) {
      return deepCamelcaseKeys(result);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to link diagnosis to institution");
  }
};







export const getCancerTypeByTypeService = async (title) => {
  const titleSearchValue = `%${title}%`;
  const query = `SELECT * FROM cancers WHERE title ILIKE :titleSearchValue OR id IN (SELECT cancer_id FROM cancer_synonyms WHERE synonym ILIKE :titleSearchValue)`;
  const results = await sequelize.query(query, {
    replacements: { titleSearchValue },
    type: sequelize.QueryTypes.SELECT,
  });
  const cancerType = results[0];
  if (cancerType) {
    return deepCamelcaseKeys(cancerType);
  }
}

export const getCancerTypeByIdService = async (id) => {
  const query = `SELECT * FROM cancers WHERE id = :id`;
  const results = await sequelize.query(query, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT,
  });
  const cancerType = results[0];
  if (cancerType) {
    return deepCamelcaseKeys(cancerType);
  }
}

export const getAllCancerTypesService = async (id) => {
  const query = `SELECT * FROM cancers`;
  const results = await sequelize.query(query, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT,
  });
  const cancerType = results;
  if (cancerType) {
    return deepCamelcaseKeys(cancerType);
  }
}

export const getAllCancerSubtypesByCancerTypeService = async (cancerTypeId) => {
  const query = `SELECT * FROM cancer_subtypes WHERE cancer_id = :cancerTypeId`;
  const results = await sequelize
    .query(query, {
      replacements: { cancerTypeId },
      type: sequelize.QueryTypes.SELECT,
    });
  const cancerSubtypes = results;
  if (cancerSubtypes) {
    return deepCamelcaseKeys(cancerSubtypes);
  }
}



//create a new cancer type in the cancers table, add the title and organ 
export const createCancerTypeService = async ({ title, organ }) => {

  //check if the cancer type exists in the cancers table
  const existingCancerType = await getCancerTypeByTypeService(title);
  if (existingCancerType) {
    throw new Error("Cancer type already exists");
  }
  try {
    const query = `INSERT INTO cancers (title, organ) VALUES (:title, :organ) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: { title, organ },
      type: sequelize.QueryTypes.INSERT,
    });
    const cancerType = results[0];
    if (cancerType) {
      return deepCamelcaseKeys(cancerType);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create cancer type");
  }
};

//create a new cancer subtype in the cancer_subtypes table, add the title and cancer type id
export const createCancerSubtypeService = async ({ title, cancerTypeId }) => {
  //check if the cancer type id exists in the cancers table
  const existingSubtype = await getCancerSubtypeByTitle(title);

  if (existingSubtype) {
    throw new Error("Cancer subtype already exists");
  }
  try {
    const query = `INSERT INTO cancer_subtypes (title, cancer_id) VALUES (:title, :cancerTypeId) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: { title, cancerTypeId },
      type: sequelize.QueryTypes.INSERT,
    });
    const cancerSubtype = results[0];
    if (cancerSubtype) {
      return deepCamelcaseKeys(cancerSubtype);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create cancer subtype");
  }
};

//get cancer subtype by title or synonym
export const getCancerSubtypeByTitle = async (title) => {
  const titleSearchValue = `%${title}%`;
  const query = `SELECT * FROM cancer_subtypes WHERE title ILIKE :titleSearchValue OR id IN (SELECT subtype_id FROM cancer_subtype_synonyms WHERE synonym ILIKE :titleSearchValue)`;
  const results = await sequelize.query(query, {
    replacements: { titleSearchValue },
    type: sequelize.QueryTypes.SELECT,
  });
  const cancerSubtype = results[0];
  if (cancerSubtype) {
    return deepCamelcaseKeys(cancerSubtype);
  }
}

//get diagnosis by provider 
export const getDiagnosisByProviderService = async (id, patientId, accessLevel) => {
  try {
    const query = `select d.*, pl.first_name, pl.last_name, pl.designation, pl.id as provider_id from diagnoses d
    inner join patient_provider_diagnosis ppd on d.id = ppd.diagnosis_Id
    inner join providers pl on ppd.provider_id = pl.id
    where pl.id = :id
    and ppd.patient_id = :patientId
    `;
    const results = await sequelize.query(query, {
      replacements: { id: id, patientId: patientId, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const diagnoses = results;
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch diagnoses");
  }
};


// update diagnosis
export const updateDiagnosisService = async ({ data }) => {
  const { id, startDate, title, category, type, subtype, attributes, status, diseaseState, notes, endDate, validated, accessLevelId, color, pubMedKeywords, clinicalTrialsKeywords, highlighted, units, stage, grade, primarySize, currentSize } = data;
  try {
    const organs = JSON.stringify(attributes);
    const query = `UPDATE diagnoses SET start_date = :startDate, title = :title, category = :category, type = :type, subtype = :subtype, metadata = :organs, status = :status, disease_status = :diseaseState, notes = :notes, end_date = :endDate, validated = :validated, access_level_id = :accessLevelId, color = :color, pub_med_keywords = :pubMedKeywords, clinical_trials_keywords = :clinicalTrialsKeywords, highlighted = :highlighted, size_units = :units, stage = :stage, grade = :grade, primary_size = :primarySize, current_size = :currentSize WHERE id = :id RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: { id, startDate, title, category, type, subtype, organs, status, diseaseState, notes, endDate, validated, accessLevelId, color, pubMedKeywords, clinicalTrialsKeywords, highlighted, units, stage, grade, primarySize, currentSize },
      type: sequelize.QueryTypes.UPDATE,
    });
    const diagnoses = results[0][0];
    if (diagnoses) {
      return deepCamelcaseKeys(diagnoses);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update diagnosis");
  }
};

export const removeDiagnosisProviderLinkService = async ({ diagnosisId, providerId }) => {
  try {
    const query = `DELETE FROM patient_provider_diagnosis WHERE diagnosis_id = :diagnosisId AND provider_id = :providerId`;
    await sequelize
      .query(query, {
        replacements: { diagnosisId, providerId },
        type: sequelize.QueryTypes.DELETE,
      });
  }
  catch (error) {
    console.log(error);
    throw new Error("Failed to remove provider from diagnosis");
  }
}


export const removeDiagnosisInstitutionLinkService = async ({ diagnosisId, institutionId }) => {
  try {
    const query = `DELETE FROM patient_institution_diagnosis WHERE diagnosis_id = :diagnosisId AND institution_id = :institutionId`;
    await sequelize
      .query(query, {
        replacements: { diagnosisId, institutionId },
        type: sequelize.QueryTypes.DELETE,
      });
  }
  catch (error) {
    console.log(error);
    throw new Error("Failed to remove institution from diagnosis");
  }
}

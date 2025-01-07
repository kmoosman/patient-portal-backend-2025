import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllInterventionsByPatientService = async ({ id, lastLogin, accessLevel }) => {

  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND patient_interventions.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `SELECT patient_interventions.*,
    COALESCE(json_agg(
        json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        ) ORDER BY p.id
    ) FILTER (WHERE p.id IS NOT NULL), '[]') AS providers,

   COALESCE(json_agg(
        json_build_object(
            'id', i.id,
            'title', i.title
        ) ORDER BY i.id
    ) FILTER (WHERE i.id IS NOT NULL), '[]') AS institutions,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', il.id,
            'title', il.title,
            'link', il.link,
            'category', il.category,
            'description', il.description,
            'notes', il.notes
        )) FROM intervention_links il
        WHERE il.intervention_id = patient_interventions.id),
        '[]'
    ) AS links
FROM patient_interventions
LEFT JOIN patient_intervention_providers pip
    ON patient_interventions.id = pip.intervention_id 
LEFT JOIN providers p
    ON pip.provider_id = p.id
LEFT JOIN institutions i
    ON patient_interventions.institution_id = i.id
WHERE patient_interventions.patient_id = :id
AND patient_interventions.access_level_id >= :accessLevel
${additionalCondition}
GROUP BY patient_interventions.id;
`;
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

export const getAllInterventionsByDiagnosisService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT patient_interventions.*,
    COALESCE(json_agg(
        json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        ) ORDER BY p.id
    ) FILTER (WHERE p.id IS NOT NULL), '[]') AS providers,

   COALESCE(json_agg(
        json_build_object(
            'id', i.id,
            'title', i.title
        ) ORDER BY i.id
    ) FILTER (WHERE i.id IS NOT NULL), '[]') AS institutions
FROM patient_interventions
LEFT JOIN patient_intervention_providers pip
    ON patient_interventions.id = pip.intervention_id 
LEFT JOIN providers p
    ON pip.provider_id = p.id
LEFT JOIN institutions i
    ON patient_interventions.institution_id = i.id
WHERE patient_interventions.diagnosis_id = :id
AND patient_interventions.access_level_id >= :accessLevel
GROUP BY patient_interventions.id;`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results;
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    throw new Error("Failed to fetch institutions");
  }
};

export const getInterventionByIdService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT patient_interventions.*,
    COALESCE(json_agg(
        json_build_object(
            'providerId', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        ) ORDER BY p.id
    ) FILTER (WHERE p.id IS NOT NULL), '[]') AS providers,
   COALESCE(json_agg(
        json_build_object(
            'id', i.id,
            'title', i.title
        ) ORDER BY i.id
    ) FILTER (WHERE i.id IS NOT NULL), '[]') AS institutions,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', il.id,
            'title', il.title,
            'link', il.link,
            'category', il.category,
            'description', il.description,
            'notes', il.notes
        )) FROM intervention_links il
        WHERE il.intervention_id = patient_interventions.id),
        '[]'
    ) AS links
FROM patient_interventions
LEFT JOIN patient_intervention_providers pip
    ON patient_interventions.id = pip.intervention_id 
LEFT JOIN providers p
    ON pip.provider_id = p.id
LEFT JOIN institutions i
    ON patient_interventions.institution_id = i.id
WHERE patient_interventions.id = :id
AND patient_interventions.access_level_id >= :accessLevel
GROUP BY patient_interventions.id;`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel },
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

export const getAllAttachmentsForInterventionByIdService = async ({ id, accessLevel }) => {
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
    interventions_attachments
INNER JOIN
    attachments a ON interventions_attachments.attachment_id = a.id
LEFT JOIN
    institutions i ON a.institution_id = i.id
WHERE
interventions_attachments.intervention_id = :id
AND a.access_level_id >= :accessLevel
GROUP BY
    a.id;
`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
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

export const createInterventionService = async (patientIntervention) => {
  const replacements = {
    id: uuidv4(),
    ...patientIntervention,
    metadata: JSON.stringify(patientIntervention.metadata)
  };
  try {
    const query = `INSERT INTO patient_interventions (id, patient_id, title, reason, category, result, start_date, end_date, days_admitted, notes, institution_id, diagnosis_id, list_order, access_level_id, metadata) 
    VALUES (:id, :patientId, :title, :reason, :category, :result, :startDate, :endDate, :daysAdmitted, :notes, :institutionId, :diagnosisId, :listOrder, :accessLevelId, :metadata) RETURNING *;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    return results[0];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create intervention");
  }
};

export const createInterventionProviderService = async ({ interventionId, providerId, patientId }) => {
  try {
    const query = `INSERT INTO patient_intervention_providers (intervention_id, provider_id, patient_id) VALUES (:interventionId, :providerId, :patientId) RETURNING *;`;
    const results = await sequelize.query(query, {
      replacements: { interventionId, providerId, patientId },
      type: sequelize.QueryTypes.INSERT,
    });
    return results[0];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create intervention provider");
  }
}

export const getInterventionProvidersService = async ({ interventionId, patientId, accessLevel }) => {
  try {
    const query = `SELECT p.* FROM patient_intervention_providers pip
    LEFT JOIN providers p ON pip.provider_id = p.id
    WHERE pip.intervention_id = :interventionId
    AND pip.patient_id = :patientId`;
    const results = await sequelize.query(query, {
      replacements: { interventionId, patientId },
      type: sequelize.QueryTypes.SELECT,
    });
    return deepCamelcaseKeys(results);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch intervention providers");
  }
}

export const removeInterventionProviderService = async ({ interventionId, providerId, patientId }) => {
  try {
    const query = `DELETE FROM patient_intervention_providers WHERE intervention_id = :interventionId AND provider_id = :providerId AND patient_id = :patientId;`;
    const results = await sequelize.query(query, {
      replacements: { interventionId, providerId, patientId },
      type: sequelize.QueryTypes.DELETE,
    });
    return results[0];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to remove intervention provider");
  }
}

//update intervention
export const updateInterventionService = async (patientIntervention) => {

  const replacements = {
    ...patientIntervention,
    metadata: convertMetadata(patientIntervention.metadata)
  };
  try {
    const query = `UPDATE patient_interventions SET title = :title, reason = :reason, category = :category, result = :result, start_date = :startDate, end_date = :endDate, days_admitted = :daysAdmitted, notes = :notes, institution_id = :institutionId, diagnosis_id = :diagnosisId, list_order = :listOrder, access_level_id = :accessLevelId, metadata = :metadata WHERE id = :id RETURNING *;`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });
    return results[0];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update intervention");
  }
};


function convertMetadata(metadata) {
  let convertedMetadata = {};
  if (metadata.organs && Array.isArray(metadata.organs)) {
    if (metadata.organs.length > 0 && typeof metadata.organs[0] === 'object') {
      convertedMetadata.organs = metadata.organs.map(organ => organ.value);
    } else {
      convertedMetadata.organs = metadata.organs;
    }
  }
  return JSON.stringify(convertedMetadata);
}
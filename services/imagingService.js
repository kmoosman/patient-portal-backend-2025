import sequelize from "../config/database.js";
// import camelcaseKeys from "camelcase-keys";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllImagingByPatientService = async ({ id, lastLogin, accessLevel }) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND pi.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `SELECT
    pi.id,
    pi.patient_id,
    pi.title,
    pi.category,
    pi.reason,
    pi.start_date,
    pi.end_date,
    pi.report,
    pi.status,
    pi.impression,
    pi.verified,
    pi.notes,
    pi.list_order,
    pi.diagnosis_id,
    pi.metadata,
    (SELECT
        json_agg(json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        ))
     FROM providers p
     WHERE p.id = pi.ordering_provider
    ) AS ordering_provider,
    (SELECT
        json_agg(json_build_object(
            'id', i.id,
            'title', i.title
        ))
     FROM institutions i
     WHERE i.id = pi.institution_id
    ) AS institution
FROM
    patient_imaging pi
    where patient_id = :id
    AND pi.access_level_id >= :accessLevel
    ${additionalCondition};
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
    throw new Error("Failed to fetch imaging");
  }
};

export const getAllImagingByDiagnosisService = async (id, accessLevel) => {
  try {
    const query = `SELECT
      pi.id,
      pi.patient_id,
      pi.title,
      pi.category,
      pi.reason,
      pi.start_date,
      pi.end_date,
      pi.report,
      pi.status,
      pi.impression,
      pi.verified,
      pi.notes,
      pi.list_order,
      pi.metadata,
      (SELECT
          json_agg(json_build_object(
              'id', p.id,
              'first_name', p.first_name,
              'middle_initial', p.middle_initial,
              'last_name', p.last_name,
              'designation', p.designation
          ))
       FROM providers p
       WHERE p.id = pi.ordering_provider
      ) AS ordering_provider,
      (SELECT
          json_agg(json_build_object(
              'id', i.id,
              'title', i.title
          ))
       FROM institutions i
       WHERE i.id = pi.institution_id
      ) AS institution
  FROM
      patient_imaging pi
      where pi.diagnosis_id = :id
      AND pi.access_level_id >= :accessLevel;
  `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results;
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch imaging");
  }
};

export const getImagingByIdService = async (id, accesslevel) => {
  try {
    const query = `SELECT
      pi.id,
      pi.patient_id,
      pi.title,
      pi.category,
      pi.reason,
      pi.start_date,
      pi.end_date,
      pi.report,
      pi.status,
      pi.impression,
      pi.verified,
      pi.notes,
      pi.list_order,
      pi.category,
      pi.metadata,
      (SELECT
          json_agg(json_build_object(
              'id', p.id,
              'first_name', p.first_name,
              'middle_initial', p.middle_initial,
              'last_name', p.last_name,
              'designation', p.designation
          ))
       FROM providers p
       WHERE p.id = pi.ordering_provider
      ) AS ordering_provider,
      (SELECT
          json_agg(json_build_object(
              'id', i.id,
              'title', i.title
          ))
       FROM institutions i
       WHERE i.id = pi.institution_id
      ) AS institution
       (SELECT
          json_agg(json_build_object(
              'id', i.id,
              'title', i.title
          ))
       FROM institutions i
       WHERE i.id = pi.institution_id
      ) AS institution
  FROM
      patient_imaging pi
      where id = :id
      AND pi.access_level_id >= :accessLevel;
  `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const institutions = results[0];
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    throw new Error("Failed to fetch imaging");
  }
};

export const getDiagnosisByImagingIdService = async (id) => {
  try {
    const query = `SELECT
      d.*
  FROM
  patient_imaging_diagnoses
  INNER JOIN
      diagnoses d ON patient_imaging_diagnoses.diagnosis_id = d.id
  WHERE
  patient_imaging_diagnoses.imaging_id = :id
  GROUP BY
      d.id;
  `;
    const results = await sequelize.query
      (query, {
        replacements: { id: id },
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

export const getAllAttachmentsForImageRecordByIdService = async (id, accessLevel) => {
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
  imaging_attachments
  INNER JOIN
      attachments a ON imaging_attachments.attachment_id = a.id
  LEFT JOIN
      institutions i ON a.institution_id = i.id
  WHERE
  imaging_attachments.imaging_id = :id
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

export const createImagingService = async (patientImaging) => {
  const replacements = {
    id: uuidv4(),
    ...patientImaging,
    metadata: JSON.stringify(patientImaging.metadata)
  };
  try {
    const query = `INSERT INTO patient_imaging (id, patient_id, title, category, reason, ordering_provider, start_date, end_date, report, status, impression, institution_id, verified, notes, list_order, access_level_id, metadata)
    VALUES (:id, :patientId, :title, :modality, :reason, :providerId, :startDate, :endDate, :report, :status, :impression, :institution, false, :notes, :listOrder, :accessLevelId, :metadata) RETURNING *;`;

    const result = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    const imaging = result[0];
    if (imaging) {
      return deepCamelcaseKeys(imaging);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create imaging");
  }
};

// update imaging 
export const updateImagingService = async (patientImaging) => {
  const replacements = {
    ...patientImaging,
    metadata: JSON.stringify(patientImaging.metadata)
  };
  try {
    const query = `UPDATE patient_imaging SET title = :title, category = :category, reason = :reason, ordering_provider = :providerId, start_date = :startDate, end_date = :endDate, report = :report, status = :status, impression = :impression, institution_id = :institution, notes = :notes, list_order = :listOrder, metadata = :metadata WHERE id = :imagingId RETURNING *;`;

    const result = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });
    const imaging = result[0][0];
    if (imaging) {
      return deepCamelcaseKeys(imaging);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update imaging");
  }
};

export const removeImagingDiagnosisService = async ({ diagnosisId, imagingId }) => {
  try {
    const query = `DELETE FROM patient_imaging_diagnoses WHERE imaging_id = :imagingId AND diagnosis_id = :diagnosisId;`;
    const result = await sequelize.query(query, {
      replacements: { imagingId, diagnosisId },
      type: sequelize.QueryTypes.DELETE,
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to remove imaging diagnosis");
  }
};


export const createDiagnosisImagingService = async ({ imagingId, patientId, diagnosisId }) => {
  try {
    const query = `INSERT INTO patient_imaging_diagnoses (imaging_id, patient_id, diagnosis_id) VALUES (:imagingId, :patientId, :diagnosisId) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: { imagingId, patientId, diagnosisId },
      type: sequelize.QueryTypes.INSERT,
    });
    const imaging = results[0];
    if (imaging) {
      return deepCamelcaseKeys(imaging);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create diagnosis imaging record");
  }
}
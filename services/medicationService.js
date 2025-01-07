import e from "express";
import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllMedicationsByPatientService = async ({ id, lastLogin, accessLevel }) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND pm.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `SELECT
    m.*,
    pm.*,
        COALESCE(
        (SELECT json_agg(json_build_object(
            'id', d.id,
            'title', d.title
        )) FROM (
            SELECT DISTINCT d.id, d.title, d.color
            FROM diagnoses d
            INNER JOIN patient_medications pm2 ON pm2.diagnosis = d.id
            WHERE pm2.medication_id = m.id
        ) d),
        '[]'
    ) AS diagnosis,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        )) FROM (
            SELECT DISTINCT p.id, p.first_name, 'middle_initial', p.middle_initial, p.last_name, p.designation
            FROM providers p
            INNER JOIN patient_medications pm2 ON pm2.prescribing_provider = p.id
            WHERE pm2.medication_id = m.id
        ) p), 
        '[]'
    ) AS prescribing_provider,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', se.id,
            'title', se.title,
            'start_date', pmse.start_date,
            'end_date', pmse.end_date,
            'severity', pmse.severity,
            'notes', pmse.notes,
            'list_order', pmse.list_order
        )) FROM patient_medication_side_effects pmse
        LEFT JOIN side_effects_symptoms se ON pmse.side_effect_id = se.id
        WHERE pmse.medication_id = m.id), 
        '[]'
    ) AS side_effects
FROM
    medications m
INNER JOIN
    patient_medications pm ON m.id = pm.medication_id
WHERE
    pm.patient_id = :id 
    AND pm.access_level_id >= :accessLevel
    ${additionalCondition}
GROUP BY
    m.id, pm.id;
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
    console.log(error);
    throw new Error("Failed to fetch medications");
  }
};

export const getAllMedicationsByDiagnosisService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT
    m.*,
    pm.*,
        COALESCE(
        (SELECT json_agg(json_build_object(
            'id', d.id,
            'title', d.title
        )) FROM (
            SELECT DISTINCT d.id, d.title, d.color
            FROM diagnoses d
            INNER JOIN patient_medications pm2 ON pm2.diagnosis = d.id
            WHERE pm2.medication_id = m.id
        ) d),
        '[]'
    ) AS diagnosis,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'middle_initial', p.middle_initial,
            'last_name', p.last_name,
            'designation', p.designation
        )) FROM (
            SELECT DISTINCT p.id, p.first_name, 'middle_initial', p.middle_initial, p.last_name, p.designation
            FROM providers p
            INNER JOIN patient_medications pm2 ON pm2.prescribing_provider = p.id
            WHERE pm2.medication_id = m.id
        ) p),
        '[]'
    ) AS prescribing_provider,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', se.id,
            'title', se.title,
            'start_date', pmse.start_date,
            'end_date', pmse.end_date,
            'severity', pmse.severity,
            'notes', pmse.notes,
            'list_order', pmse.list_order
        )) FROM patient_medication_side_effects pmse
        LEFT JOIN side_effects_symptoms se ON pmse.side_effect_id = se.id
        WHERE pmse.medication_id = m.id),
        '[]'
    ) AS side_effects
FROM
    medications m
INNER JOIN
    patient_medications pm ON m.id = pm.medication_id
WHERE
    pm.diagnosis = :id
    AND pm.access_level_id >= :accessLevel
GROUP BY
    m.id, pm.id;
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
    console.log(error);
    throw new Error("Failed to fetch medications");
  }
};

export const getPatientMedicationByIdService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT
    m.*,
    pm.*,
        COALESCE(
        (SELECT json_agg(json_build_object(
            'id', d.id,
            'title', d.title
        )) FROM (
            SELECT DISTINCT d.id, d.title, d.color
            FROM diagnoses d
            INNER JOIN patient_medications pm2 ON pm2.diagnosis = d.id
            WHERE pm2.medication_id = m.id
        ) d),
        '[]'
    ) AS diagnosis,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', p.id,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'designation', p.designation
        )) FROM (
            SELECT DISTINCT p.id, p.first_name, 'middle_initial', p.middle_initial, 'middle_initial', p.middle_initial, p.last_name, p.designation
            FROM providers p
            INNER JOIN patient_medications pm2 ON pm2.prescribing_provider = p.id
            WHERE pm2.medication_id = m.id
        ) p),
        '[]'
    ) AS prescribing_provider,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', se.id,
            'title', se.title,
            'start_date', pmse.start_date,
            'end_date', pmse.end_date,
            'severity', pmse.severity,
            'notes', pmse.notes,
            'list_order', pmse.list_order
        )) FROM patient_medication_side_effects pmse
        LEFT JOIN side_effects_symptoms se ON pmse.side_effect_id = se.id
        WHERE pmse.medication_id = m.id),
        '[]'
    ) AS side_effects,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', ml.id,
            'title', ml.title,
            'link', ml.link,
            'category', ml.category,
            'description', ml.description,
            'notes', ml.notes
        )) FROM medication_links ml
        WHERE ml.medication_id = pm.id),
        '[]'
    ) AS links,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'id', ma.medication_id,
            'title', a.title,
            'link', a.link,
            'category', a.category,
            'notes', a.notes
        )) FROM medications_attachments ma
        INNER JOIN attachments a on ma.attachment_id = a.id
        WHERE ma.medication_id = pm.id),
        '[]'
    ) AS attachments
FROM
    medications m
INNER JOIN
    patient_medications pm ON m.id = pm.medication_id
WHERE
    pm.id = :id
    AND pm.access_level_id >= :accessLevel
GROUP BY
    m.id, pm.id;
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
    console.log(error);
    throw new Error("Failed to fetch medications");
  }
};

export const getAllRelatedMedicationsByIdService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT
      linked_pm.*
  FROM
      medications_relations mr
  INNER JOIN
      patient_medications pm ON mr.patient_medication_id = pm.id
  INNER JOIN
      patient_medications linked_pm ON mr.linked_patient_medication_id = linked_pm.id
  WHERE
      pm.id = :id
      AND pm.access_level_id >= :accessLevel
  `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });

    const filteredResults = results.filter((result) => result.access_level_id >= accessLevel);
    const institutions = filteredResults;
    if (institutions) {
      return deepCamelcaseKeys(institutions);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch medications");
  }
};

//search medications by title
export const searchMedicationsByTitleService = async (title) => {
  try {
    const query = `SELECT * from medications where title = :title`;
    const results = await sequelize.query(query, {
      replacements: { title: `${title}` },
      type: sequelize.QueryTypes.SELECT,
    });
    if (results) {
      return deepCamelcaseKeys(results[0]);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch medications");
  }
};


export const createPatientMedicationService = async (patientMedication) => {
  const patientMedicationId = patientMedication.id ? patientMedication.id : uuidv4();
  patientMedication.id = patientMedicationId;
  if (patientMedication.endDate === "") {
    patientMedication.endDate = null;
  }


  try {
    const query = `INSERT INTO patient_medications (
      id,
      title,
      patient_id,
      medication_id,
      prescribing_provider,
      start_date,
      end_date,
      status,
      dosage,
      units,
      notes,
      diagnosis,
      reason,
      alternative,
      access_level_id,
      frequency,
      interval
    ) VALUES (
      :id,
      :title,
      :patientId,
      :medicationId,
      :prescribingProvider,
      :startDate,
      :endDate,
      :status,
      :dosage,
      :units,
      :notes,
      :diagnosis,
      :reason,
      :alternative,
      :accessLevelId,
      :frequency,
      :interval
    ) RETURNING *;`;
    const result = await sequelize.query(query, {
      replacements: patientMedication,
      type: sequelize.QueryTypes.INSERT,
    });
    return deepCamelcaseKeys(result[0]);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create patient medication");
  }
}

export const createMedicationService = async (medication) => {
  const medicationId = medication.id ? medication.id : uuidv4();
  medication.id = medicationId;

  try {
    const query = `INSERT INTO medications (
      id,
      title
    ) VALUES (
      :id,
      :title
    ) RETURNING *;`;
    const result = await sequelize.query(query, {
      replacements: medication,
      type: sequelize.QueryTypes.INSERT,
    });
    return deepCamelcaseKeys(result[0]);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create medication");
  }
}

//update medication service 
export const updateMedicationService = async (patientMedication) => {
  try {
    const query = `UPDATE patient_medications SET
    title = :title,
    prescribing_provider = :prescribingProvider,
    start_date = :startDate,
    end_date = :endDate,
    status = :status,
    dosage = :dosage,
    units = :units,
    notes = :notes,
    diagnosis = :diagnosis,
    reason = :reason,
    alternative = :alternative,
    access_level_id = :accessLevelId,
    frequency = :frequency,
    interval = :interval
    WHERE id = :id RETURNING *;`;
    const result = await sequelize.query(query, {
      replacements: patientMedication,
      type: sequelize.QueryTypes.UPDATE,
    });
    return deepCamelcaseKeys(result[0][0]);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update medication");
  }
}

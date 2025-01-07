import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

export const getAllLabsByPatientService = async ({
  id,
  highlighted,
  lastLogin,
  accessLevel,
}
) => {
  const includeHighlighted = highlighted ? "AND lr.highlighted = true" : "";
  try {
    let additionalCondition = "";

    if (lastLogin) {
      additionalCondition = "AND lr.created_at > :lastLogin";
    }
    let query = `SELECT
    lr.*,
    COALESCE(
      json_agg(
          CASE
              WHEN pi.id IS NOT NULL THEN json_build_object(
                  'id', pi.id,
                  'title', pi.title,
                  'status', pi.status,
                  'date', pi.start_date
              )
              ELSE NULL
          END
      ) FILTER (WHERE pi.id IS NOT NULL AND pi.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'),
      '[]'
  ) AS imaging,
  COALESCE(
    (
        SELECT json_agg(json_build_object('id', int.id, 'title', int.title, 'date', int.start_date))
        FROM patient_interventions int
        WHERE int.patient_id = lr.patient_id
        AND int.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'
    ),
    '[]'::json
) AS interventions,
    json_build_object('institution_id', i.id, 'institution_name', i.title) AS institution
FROM
    lab_results lr
LEFT JOIN
    patient_imaging pi ON lr.patient_id = pi.patient_id AND pi.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'
LEFT JOIN LATERAL
    (SELECT * FROM patient_imaging pi2 WHERE pi2.patient_id = lr.patient_id ORDER BY pi2.start_date DESC LIMIT 1) pi_recent ON pi.id IS NULL
LEFT JOIN
    patient_interventions int ON lr.patient_id = int.patient_id AND int.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'
LEFT JOIN
    institutions i ON lr.institution_id = i.id
WHERE
    lr.patient_id = :id
    AND lr.access_level_id >= :accessLevel
    `;

    if (highlighted) {
      query += " AND lr.highlighted = true";
    }
    query += additionalCondition;
    query += " GROUP BY lr.id, i.id";
    const labs = await sequelize.query(query, {
      replacements: {
        id: id,
        includeHighlighted: includeHighlighted,
        lastLogin: lastLogin,
        accessLevel: accessLevel,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    if (labs) {
      return deepCamelcaseKeys(labs);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch labs");
  }
};

export const getAllLabsByPatientBetweenDatesService = async ({
  id,
  startDate,
  daysBefore,
  daysAfter,
  highlighted,
  accessLevel
}) => {
  const includeHighlighted = highlighted ? "AND lr.highlighted = true" : "";
  try {
    let query = `SELECT
    lr.*,
    COALESCE(
      json_agg(
          CASE
              WHEN pi.id IS NOT NULL THEN json_build_object(
                  'id', pi.id,
                  'title', pi.title,
                  'status', pi.status,
                  'date', pi.start_date
              )
              ELSE NULL
          END
      ) FILTER (WHERE pi.id IS NOT NULL AND pi.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'),
      '[]'
  ) AS imaging,
    COALESCE(
      (
          SELECT json_agg(json_build_object('id', int.id, 'title', int.title, 'date', int.start_date))
          FROM patient_interventions int
          WHERE int.patient_id = lr.patient_id
          AND int.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'
      ),
      '[]'::json
  ) AS interventions,
      json_build_object('institution_id', i.id, 'institution_name', i.title) AS institution
  FROM
      lab_results lr
  LEFT JOIN
      patient_imaging pi ON lr.patient_id = pi.patient_id AND pi.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'
  LEFT JOIN LATERAL
      (SELECT * FROM patient_imaging pi2 WHERE pi2.patient_id = lr.patient_id ORDER BY pi2.start_date DESC LIMIT 1) pi_recent ON pi.id IS NULL
  LEFT JOIN
      patient_interventions int ON lr.patient_id = int.patient_id AND int.start_date BETWEEN lr.start_date - INTERVAL '7 days' AND lr.start_date + INTERVAL '14 days'
  LEFT JOIN
      institutions i ON lr.institution_id = i.id
  WHERE
      lr.patient_id = :id
  AND
      lr.start_date BETWEEN :startDate::date - INTERVAL :daysBefore DAY AND :startDate::date + INTERVAL :daysAfter DAY
      AND lr.access_level_id >= :accessLevel`;

    if (highlighted) {
      query += " AND lr.highlighted = true";
    }

    query += " GROUP BY lr.id, i.id";
    const labs = await sequelize.query(query, {
      replacements: {
        id: id,
        startDate: startDate,
        daysBefore: daysBefore,
        daysAfter: daysAfter,
        includeHighlighted: includeHighlighted,
        accessLevel: accessLevel,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    if (labs) {
      return deepCamelcaseKeys(labs);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch labs");
  }
};

export const getAllLabPanelsService = async (res) => {
  try {
    const query = `SELECT
    p.id AS id,
    p.title AS title,
    json_agg(
        json_build_object(
            'id', f.id,
            'title', f.title,
            'units', f.units,
            'low', f.low,
            'high', f.high
        )
    ) AS fields
FROM 
    lab_panels p
LEFT JOIN 
    lab_panel_fields f ON p.id = f.panel_id
WHERE 1=1
GROUP BY 
    p.id, p.title;
`;
    const panels = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    if (panels) {
      return deepCamelcaseKeys(panels);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch panels");
  }
};

//create a new lab
export const createLabService = async (
  res,
  institutionId,
  providerId,
  panel,
  notes,
  panelFields,
  patientId,
  startDate
) => {
  const transaction = await sequelize.transaction();

  try {
    let insertedLabs = [];
    const panelId = uuidv4();
    for (const field of panelFields) {
      const query = `
        INSERT INTO lab_results (id, institution_id, ordering_provider, items_tested, start_date, title, panel, panel_id, patient_id, notes, value, reference_range_low, reference_range_high, units) 
        VALUES (:labId, :institutionId, :providerId, :itemsTested, :startDate, :title, :panel, :panelId, :patientId, :notes, :value, :low, :high, :units) 
        RETURNING *;
      `;

      const replacements = {
        labId: uuidv4(),
        institutionId: institutionId,
        providerId: providerId,
        itemsTested: field.title,
        startDate: startDate,
        title: field.title,
        panel: panel,
        panelId: panelId,
        patientId: patientId,
        notes: notes,
        value: field.value,
        low: field.low,
        high: field.high,
        units: field.units,
      };

      // Execute each insert query
      const result = await sequelize.query(query, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT, // This is fine as you're using RETURNING *
      });

      insertedLabs.push(...result);
    }

    if (insertedLabs.length > 0) {
      await transaction.commit();
      return deepCamelcaseKeys(insertedLabs);
    } else {
      return null;
    }
  } catch (err) {
    console.log(err);
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to log lab results queries" });
  }
};

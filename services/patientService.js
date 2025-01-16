import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllPatientDetailsService = async (id) => {
  try {
    const query = `SELECT * FROM patients
    WHERE id = :id`;
    const results = await sequelize.query(query, {
      replacements: { id: id },
      type: sequelize.QueryTypes.SELECT,
    });
    const patient = results[0];
    if (patient) {
      return deepCamelcaseKeys(patient);
    }
  } catch (error) {
    throw new Error("Failed to patient details");
  }
};

export const getAllFamilyHistoryForPatientService = async ({
  id,
  accessLevel,
}) => {
  try {
    const query = `SELECT * FROM patient_family_history
    WHERE patient_id = :id
    AND access_level_id >= :accessLevel`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const patient = results;
    if (patient) {
      return deepCamelcaseKeys(patient);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to patient's family history");
  }
};

export const getAllAppointmentsForPatientService = async ({
  id,
  accessLevel,
}) => {
  try {
    const query = `SELECT
    patient_appointments.*,
      COALESCE(json_agg(
        json_build_object(
          'id', d.id,
          'title', d.title,
          'category', d.category,
          'color', d.color
        ) ORDER BY d.id
      ) FILTER(WHERE pad.diagnosis_id IS NOT NULL), '[]') AS diagnoses,
        COALESCE(
          json_agg(
            CASE
                  WHEN i.id IS NOT NULL THEN json_build_object('institution_id', i.id, 'institution_name', i.title)
                  ELSE NULL
              END
          ) FILTER(WHERE i.id IS NOT NULL),
          '[]':: json
        ) AS institutions
          ,
          COALESCE(
            json_agg(
              CASE
                  WHEN p.id IS NOT NULL THEN json_build_object(
                'id', p.id,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'designation', p.designation
              )
                  ELSE NULL
              END
            ) FILTER(WHERE p.id IS NOT NULL),
            '[]':: json
          ) AS providers
    FROM
    patient_appointments
LEFT JOIN
    patient_appointment_diagnoses pad ON patient_appointments.id = pad.appointment_id
LEFT JOIN diagnoses d on pad.diagnosis_id = d.id
LEFT JOIN institutions i on patient_appointments.institution_id = i.id
LEFT JOIN providers p on patient_appointments.provider_id = p.id
    WHERE
    patient_appointments.patient_id = :id
    AND patient_appointments.access_level_id >= :accessLevel
GROUP BY
    patient_appointments.id;
    `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });

    const appointments = results;
    if (appointments) {
      return deepCamelcaseKeys(appointments);
    }
  } catch (error) {
    throw new Error("Failed to fetch appointmetns");
  }
};

export const getAllAppointmentsByDiagnosisService = async ({
  id,
  accessLevel,
}) => {
  try {
    const query = `SELECT
    patient_appointments.*,
      COALESCE(json_agg(
        json_build_object(
          'id', d.id,
          'title', d.title,
          'category', d.category,
          'color', d.color
        ) ORDER BY d.id
      ) FILTER(WHERE pad.diagnosis_id IS NOT NULL), '[]') AS diagnoses,
        COALESCE(
          json_agg(
            CASE
                  WHEN i.id IS NOT NULL THEN json_build_object('institution_id', i.id, 'institution_name', i.title)
                  ELSE NULL
              END
          ) FILTER(WHERE i.id IS NOT NULL),
          '[]':: json
        ) AS institutions
          ,
          COALESCE(
            json_agg(
              CASE
                  WHEN p.id IS NOT NULL THEN json_build_object(
                'id', p.id,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'designation', p.designation
              )
                  ELSE NULL
              END
            ) FILTER(WHERE p.id IS NOT NULL),
            '[]':: json
          ) AS providers
    FROM
    patient_appointments
LEFT JOIN
    patient_appointment_diagnoses pad ON patient_appointments.id = pad.appointment_id
LEFT JOIN diagnoses d on pad.diagnosis_id = d.id
LEFT JOIN institutions i on patient_appointments.institution_id = i.id
LEFT JOIN providers p on patient_appointments.provider_id = p.id
    WHERE
    pad.diagnosis_id = :id
    AND patient_appointments.access_level_id >= :accessLevel
GROUP BY
    patient_appointments.id;
    `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });

    const appointments = results;
    if (appointments) {
      return deepCamelcaseKeys(appointments);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch appointmetns");
  }
};

export const getAppointmentByIdService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT
    patient_appointments.*,
      COALESCE(json_agg(
        json_build_object(
          'id', d.id,
          'title', d.title,
          'category', d.category,
          'color', d.color
        ) ORDER BY d.id
      ) FILTER(WHERE pad.diagnosis_id IS NOT NULL), '[]') AS diagnoses,
        COALESCE(
          json_agg(
            CASE
                  WHEN i.id IS NOT NULL THEN json_build_object('institution_id', i.id, 'institution_name', i.title)
                  ELSE NULL
              END
          ) FILTER(WHERE i.id IS NOT NULL),
          '[]':: json
        ) AS institutions
          ,
          COALESCE(
            json_agg(
              CASE
                  WHEN p.id IS NOT NULL THEN json_build_object(
                'id', p.id,
                'firstName', p.first_name,
                'lastName', p.last_name,
                'designation', p.designation
              )
                  ELSE NULL
              END
            ) FILTER(WHERE p.id IS NOT NULL),
            '[]':: json
          ) AS providers,
            COALESCE(
              json_agg(
                CASE
                WHEN att.id IS NOT NULL THEN json_build_object(
                  'id', att.id,
                  'title', att.title,
                  'link', att.link,
                  'start_date', att.start_date,
                  'category', att.category,
                  'highlight', att.highlight,
                  'notes', att.notes,
                  'instution_id', att.institution_id
                )
                ELSE NULL
            END
              ) FILTER(WHERE att.id IS NOT NULL),
              '[]':: json
            ) AS appointment_attachments
    FROM
    patient_appointments
LEFT JOIN
    patient_appointment_diagnoses pad ON patient_appointments.id = pad.appointment_id
LEFT JOIN diagnoses d on pad.diagnosis_id = d.id
LEFT JOIN institutions i on patient_appointments.institution_id = i.id
LEFT JOIN providers p on patient_appointments.provider_id = p.id
LEFT JOIN
    appointment_attachments aa ON patient_appointments.id = aa.appointment_id
LEFT JOIN
    attachments att ON aa.attachment_id = att.id
    WHERE
    patient_appointments.id = :id
    AND patient_appointments.access_level_id >= :accessLevel
GROUP BY
    patient_appointments.id;
    `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });

    const appointments = results[0];
    if (appointments) {
      return deepCamelcaseKeys(appointments);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch appointmetns");
  }
};

export const getAllTimelineEventsForPatientService = async ({
  id,
  accessLevel,
}) => {
  try {
    const query = `SELECT
    timeline_events.*,
      COALESCE(json_agg(
        json_build_object(
          'id', timeline_event_links.id,
          'link', timeline_event_links.link,
          'title', timeline_event_links.title,
          'category', timeline_event_links.category,
          'description', timeline_event_links.description,
          'notes', timeline_event_links.notes
        ) ORDER BY timeline_events.id
      ) FILTER(WHERE timeline_event_links.id IS NOT NULL), '[]') AS links
    FROM
    timeline_events
LEFT JOIN
    timeline_event_links ON timeline_events.id = timeline_event_links.timeline_event_id
    WHERE
    patient_id = :id
    AND timeline_events.access_level_id >= :accessLevel
GROUP BY
    timeline_events.id; `;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const timeline = results;
    if (timeline) {
      return deepCamelcaseKeys(timeline);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to timeline events");
  }
};

export const getTimelineEventByIdService = async ({ id, accessLevel }) => {
  try {
    const query = `SELECT
    timeline_events.*,
      COALESCE(json_agg(
        json_build_object(
          'id', timeline_event_links.id,
          'link', timeline_event_links.link,
          'title', timeline_event_links.title,
          'category', timeline_event_links.category,
          'description', timeline_event_links.description,
          'notes', timeline_event_links.notes
        ) ORDER BY timeline_events.id
      ) FILTER(WHERE timeline_event_links.id IS NOT NULL), '[]') AS links
    FROM
    timeline_events
LEFT JOIN
    timeline_event_links ON timeline_events.id = timeline_event_links.timeline_event_id
    WHERE
    timeline_events.id = :id
    AND timeline_events.access_level_id >= :accessLevel
GROUP BY
    timeline_events.id;`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const timeline = results[0];
    if (timeline) {
      return deepCamelcaseKeys(timeline);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to timeline events");
  }
};

export const getAllTissueSamplesForPatientService = async ({
  id,
  accessLevel,
}) => {
  try {
    const query = `SELECT tissue_locations.*, json_agg(json_build_object('institution_id', i.id, 'institution_name', i.title)) AS institutions, json_agg(json_build_object('id', d.id, 'title', d.title, 'color', d.color)) AS diagnosis  from tissue_locations
    INNER JOIN institutions i on tissue_locations.institution_id = i.id
    INNER JOIN diagnoses d on tissue_locations.diagnosis_id = d.id
    WHERE tissue_locations.patient_id = :id
    AND tissue_locations.access_level_id >= :accessLevel
    GROUP BY tissue_locations.id`;
    const results = await sequelize.query(query, {
      replacements: { id: id, accessLevel: accessLevel },
      type: sequelize.QueryTypes.SELECT,
    });
    const tissue = results;
    if (tissue) {
      return deepCamelcaseKeys(tissue);
    }
  } catch (error) {
    throw new Error("Failed to fetch tissue locations");
  }
};

export const getAllAttachmentsByCategoryForPatientService = async ({
  id,
  category,
  accessLevel,
}) => {
  try {
    const query = `SELECT * FROM attachments
    WHERE patient_id = :id
    and attachments.category = :category_type
    AND attachments.access_level_id >= :accessLevel
    `;
    const results = await sequelize.query(query, {
      replacements: {
        id: id,
        category_type: category,
        accessLevel: accessLevel,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    const documents = results;
    if (documents) {
      return deepCamelcaseKeys(documents);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to documents");
  }
};

export const updatePatientDetailsService = async ({ id, patient }) => {
  const replacements = {
    id: id,
    address1: patient.address_1,
    address2: patient.address_2,
    city: patient.city,
    state: patient.state,
    country: patient.country,
    postalCode: patient.postalCode,
    image: patient.image,
    email: patient.email,
    phone: patient.phone,
    cell: patient.cell,
    summary: patient.summary,
    notes: patient.notes,
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob ?? null,
    emergencyContactName: patient.emergencyContactName ?? null,
    emergencyContactPhone: patient.emergencyContactPhone ?? null,
    emergencyContactEmail: patient.emergencyContactEmail ?? null,
    emergencyContactRelation: patient.emergencyContactRelationship ?? null,
  };
  try {
    const query = `UPDATE patients
    SET 
    address_1 = :address1,
    address_2 = :address2,
    city = :city,
    state = :state,
    country = :country,
    postal_code = :postalCode,
    image = :image,
    email = :email,
    phone = :phone,
    cell = :cell,
    summary = :summary,
    notes = :notes,
    first_name = :firstName,
    last_name = :lastName,
    dob = :dob,
    emergency_contact_name = :emergencyContactName,
    emergency_contact_phone = :emergencyContactPhone,
    emergency_contact_email = :emergencyContactEmail,
    emergency_contact_relation = :emergencyContactRelation
    WHERE id = :id RETURNING *;
    `;
    const result = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });
    return deepCamelcaseKeys(result[0][0]);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update patient details");
  }
};

// create timeline event
export const createTimelineEventService = async ({ id, timelineEvent }) => {
  const timelineEventId = uuidv4();
  const replacements = {
    id: timelineEventId,
    patientId: id,
    title: timelineEvent.title,
    reason: timelineEvent.reason ?? null,
    description: timelineEvent.notes,
    category: timelineEvent.category,
    notes: timelineEvent.notes ?? null,
    startDate: timelineEvent.startDate,
    endDate: timelineEvent.endDate,
    accessLevel: timelineEvent.accessLevel ?? 1,
  };
  try {
    const query = `INSERT INTO timeline_events (id, patient_id, title, reason, description, category, notes, start_date, end_date, access_level_id) VALUES (:id, :patientId, :title, :reason, :description, :category, :notes, :startDate, :endDate, :accessLevel) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    const timeline = results[0][0];
    if (timeline) {
      return deepCamelcaseKeys(timeline);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create timeline event");
  }
};

//create timeline event link
export const createTimelineEventLinkService = async ({ id, link }) => {
  const timelineEventLinkId = uuidv4();
  const replacements = {
    id: timelineEventLinkId,
    timelineEventId: id,
    link: link.link,
    title: link.title,
    category: link.category,
    description: link.title,
    notes: link.notes,
    accessLevel: link.accessLevel ?? 1,
  };
  try {
    const query = `INSERT INTO timeline_event_links (id, timeline_event_id, link, title, category, description, notes, access_level_id) VALUES (:id, :timelineEventId, :link, :title, :category, :description, :notes, :accessLevel) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    const timeline = results[0][0];
    if (timeline) {
      return deepCamelcaseKeys(timeline);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create timeline event link");
  }
};

// Create appointment
export const createAppointmentService = async ({ id, appointment }) => {
  const appointmentId = uuidv4();
  const replacements = {
    id: appointmentId,
    patientId: id,
    title: appointment.title,
    category: appointment.category,
    reason: appointment.reason,
    providerId: appointment.providerId,
    institutionId: appointment.institutionId,
    notes: appointment.notes,
    startDate: appointment.startDate,
    time: appointment.time,
    endDate: appointment.endDate,
    accessLevel: appointment.accessLevel ?? 1,
  };
  try {
    const query = `INSERT INTO patient_appointments (id, patient_id, title, category, reason, provider_id, institution_id, notes, start_date, time, end_date, access_level_id) VALUES (:id, :patientId, :title, :category, :reason, :providerId, :institutionId, :notes, :startDate, :time, :endDate, :accessLevel) RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.INSERT,
    });
    const appointment = results[0][0];
    if (appointment) {
      return deepCamelcaseKeys(appointment);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create appointment");
  }
};

//update appointment
export const updateAppointmentService = async ({ id, appointment }) => {
  console.log(appointment);
  const replacements = {
    id: id,
    title: appointment.title ?? null,
    category: appointment.category ?? null,
    reason: appointment.reason ?? null,
    providerId: appointment.providerId ?? null,
    institutionId: appointment.institutionId ?? null,
    notes: appointment.notes ?? null,
    startDate: appointment.startDate ?? null,
    time: appointment.time ?? null,
    endDate: appointment.endDate ?? null,
  };
  try {
    const query = `UPDATE patient_appointments SET title = :title, category = :category, reason = :reason, provider_id = :providerId, institution_id = :institutionId, notes = :notes, start_date = :startDate, time = :time, end_date = :endDate WHERE id = :id RETURNING *`;
    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update appointment");
  }
};

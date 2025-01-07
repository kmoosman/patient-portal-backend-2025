import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";

export const getAllProvidersService = async ({ id, lastLogin, accessLevel }) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel };

    if (lastLogin) {
      additionalCondition = "AND patient_providers.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `select * from providers
    inner join patient_providers on providers.id = patient_providers.provider_id
    where patient_providers.patient_id = :id 
    AND patient_providers.access_level_id >= :accessLevel
    ${additionalCondition};
    `;
    const providers = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (providers) {
      return deepCamelcaseKeys(providers);
    }
  } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch providers");
  }
};

export const getAllPatientInstitutions = async ({ id, lastLogin, accessLevel }) => {
  try {
    let additionalCondition = "";
    let replacements = { id, accessLevel }

    if (lastLogin) {
      additionalCondition = "AND patient_providers.created_at > :lastLogin";
      replacements.lastLogin = lastLogin;
    }
    const query = `select * from institutions
    inner join provider_institution on institutions.id = provider_institution.institution_id
    inner join patient_institutions on institutions.id = patient_institutions.institution_id
    where patient_institutions.patient_id = :id
    AND patient_institutions.access_level_id >= :accessLevel
    `;
    const providers = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    if (providers) {
      return deepCamelcaseKeys(providers);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch patient institutions");
  }
};




export const getAllPatientDiagnosisForProviders = async ({ id, accessLevel }) => {
  try {

    let replacements = { id, accessLevel };
    const query = `select ppd.provider_id, ppd.provider_id, pl.first_name, pl.last_name, pl.designation, d.id, ppd.patient_id, d.title, d.category, d.start_date, d.end_date, d.status, d.color from patient_provider_diagnosis as ppd
    inner join diagnoses d on d.id = ppd.diagnosis_Id
    inner join providers pl on ppd.provider_id = pl.id
    where ppd.patient_id = :id
    `;
    const patientDiagnosis = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    if (patientDiagnosis) {
      return deepCamelcaseKeys(patientDiagnosis);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch patient diagnosis");
  }
};

export const getProviderByProviderIdService = async ({ providerId, patientId, accessLevel }) => {
  let replacements = { providerId, patientId, accessLevel };
  try {
    const query = `SELECT 
    providers.*, 
    patient_providers.*, 
    COALESCE(
        json_agg(
            json_build_object(
                'first_name', ps.first_name,
                'last_name', ps.last_name,
                'title', ps.title
            )
        ) FILTER (WHERE ps.provider_id IS NOT NULL), 
        '[]'
    ) AS staff, 
    json_agg(
        json_build_object(
            'institution_id', pti.institution_id, 
            'institution_name', i.title, 
            'records_office_email', pti.records_office_email, 
            'records_office_phone', pti.records_office_phone 
        )
    ) AS institutions 
FROM providers
INNER JOIN patient_providers ON providers.id = patient_providers.provider_id
LEFT JOIN provider_institution pi ON providers.id = pi.provider_id
LEFT JOIN institutions i ON pi.institution_id = i.id
LEFT JOIN patient_institutions pti ON i.id = pti.institution_id AND pti.patient_id = :patientId
LEFT JOIN providers_staff ps ON providers.id = ps.provider_id
WHERE providers.id = :providerId
AND patient_providers.patient_id = :patientId
AND patient_providers.access_level_id >= :accessLevel
GROUP BY providers.id, patient_providers.id;
`;
    const provider = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    if (provider) {
      return deepCamelcaseKeys(provider);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch providers");
  }
};

export const getProviderByIdBasicService = async ({ providerId, patientId }) => {
  let replacements = { providerId, patientId };
  try {
    const query = `SELECT
    providers.*,
    patient_providers.*
    FROM
        providers
    INNER JOIN patient_providers ON providers.id = patient_providers.provider_id
    WHERE
    providers.id = :providerId
    AND patient_providers.patient_id = :patientId
`;
    const provider = await sequelize.query
      (query, {
        replacements: replacements,
        type: sequelize.QueryTypes.SELECT,
      });
    if (provider) {
      return deepCamelcaseKeys(provider);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch providers");
  }
};


export const searchForExistingProviderByNPI = async (npi) => {
  try {
    const query = `SELECT * FROM providers WHERE npi = :npi`;
    const
      provider = await sequelize.query(query, {
        replacements: { npi },
        type: sequelize.QueryTypes.SELECT,
      });
    if (provider) {
      return deepCamelcaseKeys(provider);
    }
  }
  catch (error) {
    console.log(error);
    throw new Error("Failed to fetch providers");
  }
};


//create patient provider 
export const createPatientProviderService = async (provider) => {
  try {
    const query = `INSERT INTO patient_providers (id, patient_id, provider_id, start_date, end_date, status, address_1, address_2, city, state, country, postal_code, image, link, list_order, role, title, email, fax, cell, phone, nurses_line, after_hours, notes, internal_notes, primary_contact, access_level_id) 
    VALUES (:id, :patientId, :providerId, :startDate, :endDate, :status, :address1, :address2, :city, :state, :country, :postal, :image, :link, :listOrder, :role, :title, :email, :fax, :cell, :phone, :nursesLine, :afterHours, :notes, :internalNotes, :primaryContact, :accessLevel) RETURNING *;`;
    const createdProvider = await sequelize.query(query, {
      replacements: {
        id: uuidv4(),
        patientId: provider.patientId,
        providerId: provider.providerId,
        startDate: provider.startDate || new Date().toISOString(),
        endDate: provider.endDate || null,
        status: provider.status || "active",
        address1: provider.address1 || null,
        address2: provider.address2 || null,
        city: provider.city || null,
        state: provider.state || null,
        country: provider.country || null,
        postal: provider.postal || null,
        image: provider.image || null,
        link: provider.link || null,
        listOrder: provider.listOrder || 0,
        role: provider.role || null,
        title: provider.title || null,
        email: provider.email || null,
        fax: provider.fax || null,
        cell: provider.cell || null,
        phone: provider.phone || null,
        nursesLine: provider.nursesLine || null,
        afterHours: provider.afterHours || null,
        notes: provider.notes || null,
        internalNotes: provider.internalNotes || null,
        primaryContact: provider.primaryContact || false,
        accessLevel: provider.accessLevelId || 5,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    if (createdProvider) {
      return deepCamelcaseKeys(createdProvider);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create provider");
  }
}

export const createProviderDiagnosis = async ({ diagnosisId, providerId, patientId }) => {
  try {
    const query = `INSERT INTO patient_provider_diagnosis (patient_id, provider_id, diagnosis_id) 
    VALUES (:patientId, :providerId, :diagnosisId) RETURNING *;`;
    const createdProviderDiagnosis = await sequelize.query(query, {
      replacements: {
        patientId,
        providerId,
        diagnosisId,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    if (createdProviderDiagnosis) {
      return deepCamelcaseKeys(createdProviderDiagnosis);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create provider diagnosis");
  }
}


export const createProviderService = async (provider) => {
  try {
    const query = `INSERT INTO providers (id, first_name, last_name, designation, specialization, sub_specialization, middle_initial, npi) 
    VALUES (:id, :firstName, :lastName, :designation, :specialization, :subSpecialization, :middleInitial, :npi) RETURNING *;`;
    const createdProvider = await sequelize.query(query, {
      replacements: {
        id: uuidv4(),
        firstName: provider.firstName,
        lastName: provider.lastName,
        designation: provider.designation ?? null,
        specialization: provider.specialization ?? null,
        subSpecialization: provider.subSpecialization ?? null,
        middleInitial: provider.middleInitial ?? null,
        npi: provider.npi,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    if (createdProvider) {
      return deepCamelcaseKeys(createdProvider[0]);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create provider");
  }
}

export const createProviderInstitution = async ({ providerId, institutionId }) => {
  try {
    const query = `INSERT INTO provider_institution (provider_id, institution_id) 
    VALUES (:providerId, :institutionId) RETURNING *;`;
    const createdProviderInstitution = await sequelize.query(query, {
      replacements: {
        providerId,
        institutionId,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    if (createdProviderInstitution) {
      return deepCamelcaseKeys(createdProviderInstitution);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create provider institution");
  }
}


//Update patient provider
export const updatePatientProviderService = async (provider) => {
  try {
    const query = `UPDATE patient_providers SET 
    start_date = :startDate, 
    end_date = :endDate, 
    status = :status, 
    address_1 = :address_1, 
    address_2 = :address_2, 
    city = :city, 
    state = :state, 
    country = :country, 
    postal_code = :postal, 
    image = :image, 
    link = :link, 
    list_order = :listOrder, 
    role = :role, 
    title = :title, 
    email = :email, 
    fax = :fax, 
    cell = :cell, 
    phone = :phone, 
    nurses_line = :nursesLine, 
    after_hours = :afterHours, 
    notes = :notes, 
    internal_notes = :internalNotes, 
    primary_contact = :primaryContact, 
    access_level_id = :accessLevel
    WHERE id = :id RETURNING *;`;
    const updatedProvider = await sequelize.query(query, {
      replacements: {
        id: provider.id,
        startDate: provider.startDate,
        endDate: provider.endDate,
        status: provider.status,
        address_1: provider.address_1,
        address_2: provider.address_2,
        city: provider.city,
        state: provider.state,
        country: provider.country,
        postal: provider.postal,
        image: provider.image,
        link: provider.link,
        listOrder: provider.listOrder,
        role: provider.role,
        title: provider.title,
        email: provider.email,
        fax: provider.fax,
        cell: provider.cell,
        phone: provider.phone,
        nursesLine: provider.nursesLine,
        afterHours: provider.afterHours,
        notes: provider.notes,
        internalNotes: provider.internalNotes,
        primaryContact: provider.primaryContact,
        accessLevel: provider.accessLevelId,
      },
      type: sequelize.QueryTypes.UPDATE,
    });
    if (updatedProvider) {
      return deepCamelcaseKeys(updatedProvider);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update provider");
  }
}


// remove provider diagnosis
export const removeProviderDiagnosisService = async ({ diagnosisId, providerId, patientId }) => {
  try {
    const query = `DELETE FROM patient_provider_diagnosis WHERE provider_id = :providerId AND diagnosis_id = :diagnosisId AND patient_id = :patientId;`;
    const result = await sequelize.query(query, {
      replacements: { providerId, diagnosisId, patientId },
      type: sequelize.QueryTypes.DELETE,
    });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to remove provider diagnosis");
  }
};

//add provider institution 
export const addProviderInstitutionService = async ({ providerId, institutionId }) => {
  try {
    const query = `INSERT INTO provider_institution (provider_id, institution_id) 
    VALUES (:providerId, :institutionId) RETURNING *;`;
    const createdProviderInstitution = await sequelize.query(query, {
      replacements: {
        providerId,
        institutionId,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    if (createdProviderInstitution) {
      return deepCamelcaseKeys(createdProviderInstitution);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create provider institution");
  }
}

//get provider institution
export const getProviderInstitutionService = async ({ providerId, institutionId }) => {
  try {
    const query = `SELECT * FROM provider_institution WHERE provider_id = :providerId AND institution_id = :institutionId;`;
    const providerInstitution = await sequelize.query(query, {
      replacements: { providerId, institutionId },
      type: sequelize.QueryTypes.SELECT,
    });
    if (providerInstitution) {
      return deepCamelcaseKeys(providerInstitution);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch provider institution");
  }
}
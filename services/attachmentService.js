import sequelize from "../config/database.js";
import { deepCamelcaseKeys } from "../helpers/utils.js";
import { v4 as uuidv4 } from "uuid";
import { s3Client } from "../app.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";


export const fileUploadService = async (file, fileType = "default") => {
    try {
        const fileKey = uuidv4();
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `attachments/${fileKey}`,
            Body: file.buffer,
            ContentType: fileType === "video" ? "video/mp4" : file.mimetype,
            ContentDisposition: 'inline',
        };
        const result = await s3Client.send(new PutObjectCommand(uploadParams));
        //construct the file URL
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/attachments/${fileKey}`;
        return url;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to upload file to S3");
    }
};

export const createAttachmentService = async (url, patientId, data) => {
    const id = uuidv4();
    try {
        const { highlight, title, category, startDate, notes } = data;
        const query = `INSERT INTO attachments (id, highlight, title, category, start_date, link, notes, patient_id) VALUES (:id, :highlight, :title, :category, :startDate, :url, :notes, :patientId) RETURNING *`;
        const results = await sequelize.query(query, {
            replacements: { id, highlight, title, category, startDate, url, notes, patientId },
            type: sequelize.QueryTypes.INSERT,
        });
        const attachment = results[0][0];
        if (attachment) {
            return deepCamelcaseKeys(attachment);
        }
    } catch (error) {
        console.log(error);
        throw new Error("Failed to create attachment");
    }
};

export const linkAttachmentToDiagnosisService = async (attachmentId, diagnosis, patientId) => {
    const diagnosisId = diagnosis.id;
    try {
        const query = `INSERT INTO diagnoses_attachments (attachment_id, diagnosis_id) VALUES (:attachmentId, :diagnosisId) RETURNING *`;
        const result = await sequelize.query(query, {
            replacements: { attachmentId, diagnosisId },
            type: sequelize.QueryTypes.INSERT,
        });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    } catch (error) {
        console.log(error);
        throw new Error("Failed to link attachment to diagnosis");
    }
};

export const linkAttachmentToProviderService = async (attachmentId, provider, patientId) => {
    const providerId = provider.providerId;

    try {
        const query = `INSERT INTO provider_attachments (attachment_id, provider_id, patient_id) VALUES (:attachmentId, :providerId, :patientId) RETURNING *`;
        const result = await sequelize.query(query, {
            replacements: { attachmentId, providerId, patientId },
            type: sequelize.QueryTypes.INSERT,
        });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    } catch (error) {
        console.log(error);
        throw new Error("Failed to link attachment to provider");
    }
};

export const linkAttachmentToInstitutionService = async (attachmentId, institution, patientId) => {
    const institutionId = institution.institutionId;
    try {
        const query = `INSERT INTO institutions_attachments (attachment_id, institution_id, patient_id) VALUES (:attachmentId, :institutionId, :patientId) RETURNING *`;
        const result = await sequelize.query(query, {
            replacements: { attachmentId, institutionId, patientId },
            type: sequelize.QueryTypes.INSERT,
        });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    } catch (error) {
        console.log(error);
        throw new Error("Failed to link attachment to institution");
    }
};

export const linkAttachmentToImagingService = async (attachmentId, imaging) => {
    const imagingId = imaging.id;
    try {
        const query = `INSERT INTO imaging_attachments (attachment_id, imaging_id) VALUES (:attachmentId, :imagingId) RETURNING *`;
        const result = await sequelize.query(query, {
            replacements: { attachmentId, imagingId },
            type: sequelize.QueryTypes.INSERT,
        });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    } catch (error) {
        console.log(error);
        throw new Error("Failed to link attachment to imaging");
    }
}



export const linkAttachmentToInterventionService = async (attachmentId, intervention, patientId) => {
    const interventionId = intervention.id;
    try {
        const query = `INSERT INTO interventions_attachments (attachment_id, intervention_id, patient_id) VALUES (:attachmentId, :interventionId, :patientId) RETURNING *`;
        const result = await sequelize.query(query, {
            replacements: { attachmentId, interventionId, patientId },
            type: sequelize.QueryTypes.INSERT,
        });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to link attachment to intervention");
    }
}

export const linkAttachmentToMedicationService = async (attachmentId, medication, patientId) => {
    const medicationId = medication.id;
    try {
        const query = `INSERT INTO medications_attachments (attachment_id, medication_id, patient_id) VALUES (:attachmentId, :medicationId, :patientId) RETURNING *`;
        const result = await sequelize.query(query, {
            replacements: { attachmentId, medicationId, patientId },
            type: sequelize.QueryTypes.INSERT,
        });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    } catch (error) {
        console.log(error);
        throw new Error("Failed to link attachment to medication");
    }
}


//get attachment by Id todo: add access level to this 
export const getAttachmentByIdService = async (attachmentId) => {
    try {
        const query = `SELECT * FROM attachments WHERE id = :attachmentId`;
        const result = await sequelize.query
            (query, {
                replacements: { attachmentId },
                type: sequelize.QueryTypes.SELECT,
            });
        if (result) {
            return deepCamelcaseKeys(result);
        }
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to fetch attachment");
    }
}

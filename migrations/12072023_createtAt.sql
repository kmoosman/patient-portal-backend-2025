CREATE TABLE appointment_attachments
(
    appointment_id  uuid not null
        references patient_appointments,
    attachment_id uuid not null,
    primary key (attachment_id, appointment_id)
);

ALTER TABLE appointment_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE diagnoses
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE diagnoses_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE diagnoses_links
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE diagnosis_tags
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE imaging_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE institutions
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE institutions_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE intervention_links
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE intervention_tags
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE interventions_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE lab_results
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE medication_links
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE medications
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE medications_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE medications_relations
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_appointment_diagnoses
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_appointments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_family_history
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE patient_imaging
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_institution_diagnosis
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE patient_institutions
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_intervention_providers
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_interventions
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_medication_side_effects
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patient_medications
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;



ALTER TABLE patient_provider_diagnosis
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE patient_providers
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE patients
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE provider_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE provider_tags
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE providers
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE providers_staff
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE roles
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE side_effect_attachments
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE side_effects_symptoms
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE tags
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE timeline_event_links
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE timeline_events
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE tissue_locations
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE user_roles
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE lab_results
ADD COLUMN ordering_provider uuid  references providers;


CREATE TABLE lab_panels (
    id uuid PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE lab_panel_fields (
    id uuid PRIMARY KEY,
    panel_id uuid,
    title VARCHAR(255) NOT NULL,
    units VARCHAR(50),
    low VARCHAR(50),
    high VARCHAR(50),
    FOREIGN KEY (panel_id) REFERENCES lab_panels(id)
);

INSERT INTO lab_panels (id, title) VALUES ('52267879-3734-4aa6-832a-bfe5e6d22c83', 'CBC');

INSERT INTO lab_panel_fields (id, panel_id, title, units, low, high) VALUES
('24c0f63c-9146-42b4-915d-7355bc998105', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'WBC', 'K/uL', '4', '11'),
('3aa4c9c5-6a8f-4d2d-8368-5d464470b49a', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'RBC', 'K/uL', '3.99', '5.46'),
('6f661bdc-7234-4fe7-bac6-973f0502032e', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Hemoglobin', 'gm/dL', '12', '16'),
('7581991f-b204-4931-915d-9e223c99b4d1', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Hematocrit', '%', '36.4', '46.8'),
('1ec17a91-eb17-4743-9939-dce7e999e354', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'MCV', 'fL', '82', '98'),
('4ac1881b-bce7-47b0-b76c-36724502bdbf', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'MCH', 'pg', '27', '31'),
('1a6785f4-6291-4978-8bf5-29bb0787e08c', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'MCHC', 'g/dL', '31', '36'),
('b963ea44-7c4c-451c-aaba-da95b38513ea', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'RDW', '%', '11.6', '15.5'),
('a965e02c-2564-4dc4-9b7f-7f52974c90e3', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Platelets', 'K/mcL', '140', '440'),
('7456aa28-9ebd-4acc-bf1d-59346459c2a0', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'MPV', 'K/uL', '9.4', '10.4'),
('b64a575e-fca1-4625-a3c2-3918296468e0', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Neutrophils', '%', '34', '71.1'),
('c79c75a9-774f-4cfa-ac4a-8964ab8e946e', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Lymphocytes', '%', '19.3', '51.7'),
('57ea4894-84e7-40ef-8835-ef40d4f52f23', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Monocytes', '%', '4.7', '12.5'),
('f1f4a433-645b-4395-a0a8-c664cbcfc61a', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Eosinophils', '%', '0.7', '5.8'),
('43b5d9ef-714e-4093-b84d-7a5ef8db7958', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Basophils', '%', '0.1', '1.2'),
('88db02e1-049b-4610-9d43-f2ae4e40dccd', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Neutrophils', 'K/mcL', '1.56', '6.13'),
('c80038bd-e8cd-4158-abe4-a6a49af49e83', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Lymphocytes', 'K/mcL', '1.18', '3.74'),
('7def50f2-8103-49f2-a578-ca8efe5c9d0b', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Monocytes', 'K/mcL', '0.24', '0.86'),
('f0f49bcd-a017-4f18-bf28-4ea38132b2c0', '52267879-3734-4aa6-832a-bfe5e6d22c83', 'Eosinophils', 'K/mcL', '0', '0.4');



INSERT INTO lab_panels (id, title) VALUES ('adfe524a-a135-48fd-92e3-034e5c903bb6', 'CMP');

INSERT INTO lab_panel_fields (id, panel_id, title, units, low, high) VALUES
('5c4b8d61-66e1-486d-827a-f342d39130e8', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Albumin', 'g/dL', '3.5', '5.0'),
('870a8ed5-d8ab-445b-823d-6b3135c8f2eb', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'ALP', 'IU/L', '44', '147'),
('04ad3a34-8549-4bb3-8559-712337ffd62f', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'ALT', 'IU/L', '7', '56'),
('94033ed8-1d75-4516-a9c6-72834aabe139', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'AST', 'IU/L', '10', '40'),
('a085a6db-45d3-43e0-b6e2-200d556292e0', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'BUN', 'mg/dL', '7', '20'),
('501e420f-2957-4dae-982a-0ada54b09559', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Creatinine', 'mg/dL', '0.6', '1.2'),
('da043a38-204d-4831-93da-2c17c48a2b3d', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Sodium', 'mmol/L', '135', '145'),
('47801150-5791-4cbc-8554-8d703ad2df13', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Potassium', 'mmol/L', '3.5', '5.0'),
('9b410d2a-04ca-4206-991e-21e7334b7db6', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Chloride', 'mmol/L', '96', '106'),
('449dd1ee-8b2c-4dea-9161-8f3d8007ef4b', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'CO2', 'mmol/L', '23', '29'),
('a50f6d31-c724-4423-9dca-c6792ef00833', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Calcium', 'mg/dL', '8.5', '10.2'),
('b0f63ab3-f845-44a7-8454-65a39bd9c7e4', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Bilirubin Total', 'mg/dL', '0.1', '1.2'),
('3cd18006-4387-43b7-9d58-870f249f5a05', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Bilirubin Direct', 'mg/dL', '0', '0.3'),
('3b2fd826-5167-42a2-b456-72dda11a7b26', 'adfe524a-a135-48fd-92e3-034e5c903bb6', 'Bilirubin Indirect', 'mg/dL', '0.1', '0.9');






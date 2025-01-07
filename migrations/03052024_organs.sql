CREATE TABLE organs (
    id SERIAL primary key, 
    title VARCHAR(250)
);

INSERT INTO organs (id, title)
   VALUES
    (1, 'Lymph nodes'),
    (2, 'Liver'),
    (3, 'Lungs'),
    (4, 'Bones'),
    (5, 'Brain'),
    (6, 'Adrenal glands'),
    (7, 'Peritoneum'),
    (8, 'Skin'),
    (9, 'Kidneys'),
    (10, 'Pancreas'),
    (11, 'Pleura'),
    (12, 'Ovaries'),
    (13, 'Testicles'),
    (14, 'Spine'),
    (15, 'Pelvis'),
    (16, 'Thyroid'),
    (17, 'Bladder'),
    (18, 'Colon'),
    (19, 'Stomach'),
    (20, 'Rectum'),
    (21, 'Esophagus'),
    (22, 'Gallbladder'),
    (23, 'Prostate'),
    (24, 'Uterus'),
    (25, 'Cervix'),
    (26, 'Vulva'),
    (27, 'Vagina'),
    (28, 'Fallopian tubes'),
    (29, 'Breast'),
    (30, 'Nasal cavity'),
    (31, 'Sinuses'),
    (32, 'Oral cavity'),
    (33, 'Salivary glands'),
    (34, 'Throat (pharynx)'),
    (35, 'Voice box (larynx)'),
    (36, 'Trachea'),
    (37, 'Heart'),
    (38, 'Spleen'),
    (39, 'Diaphragm'),
    (40, 'Small intestine'),
    (41, 'Large intestine'),
    (42, 'Adipose tissue'),
    (43, 'Muscle'),
    (44, 'Skin surface'),
    (45, 'Eye'),
    (46, 'Eyelid'),
    (47, 'Orbit'),
    (48, 'Ear'),
    (49, 'Pituitary gland'),
    (50, 'Pineal gland'),
    (51, 'Abdominal wall')

ALTER TABLE diagnoses
ADD COLUMN metadata JSONB DEFAULT '{"organs": []}';

ALTER TABLE patient_interventions
ADD COLUMN metadata JSONB DEFAULT '{"organs": []}';


CREATE TABLE imaging_categories (
    id SERIAL primary key, 
    title VARCHAR(250),
    description TEXT
);

INSERT INTO imaging_categories (id, title, description)
   VALUES
    (1, 'Head', 'Imaging studies of the head, including the brain, skull, eyes, ears, sinuses, and face.'),
    (2, 'Neck', 'Imaging studies of the neck, including the lymph nodes, thyroid gland, trachea, and esophagus.'),
    (3, 'Chest', 'Imaging studies of the chest, including the lungs, heart, airways, and major blood vessels.'),
    (4, 'Abdomen', 'Imaging studies of the abdomen, including the liver, pancreas, spleen, stomach, intestines, and kidneys.'),
    (5, 'Pelvis', 'Imaging studies of the pelvis, including the bladder, uterus, ovaries, fallopian tubes, prostate gland, and rectum.'),
    (6, 'Spine', 'Imaging studies of the spine, including the cervical spine (neck), thoracic spine (chest), lumbar spine (lower back), and sacrum/coccyx (tailbone).'),
    (7, 'Extremities', 'Imaging studies of the bones, joints, muscles, and soft tissues of the extremities (arms and legs).');

CREATE TABLE imaging_types (
    id SERIAL primary key, 
    title VARCHAR(250),
    description TEXT,
    dicom_value VARCHAR(25),
     category_id INT,
    FOREIGN KEY (category_id) REFERENCES imaging_categories(id)
);

INSERT INTO imaging_types (id, title, description, dicom_value)
   VALUES
    (1, 'X-ray', 'A type of electromagnetic radiation used to create images of the inside of the body.', 'CR'),
    (2, 'CT scan', 'A type of X-ray that uses a computer to create detailed images of the inside of the body.', 'CT'),
    (3, 'MRI', 'A type of imaging that uses a magnetic field and radio waves to create detailed images of the inside of the body.', 'MR'),
    (4, 'Ultrasound', 'A type of imaging that uses high-frequency sound waves to create images of the inside of the body.', 'US'),
    (5, 'PET scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'PT'),
    (6, 'Bone scan', 'A type of imaging that uses a radioactive substance to create images of the bones.', 'NM'),
    (7, 'Mammogram', 'A type of X-ray used to create images of the breast.', 'MG'),
    (8, 'Fluoroscopy', 'A type of X-ray that uses a continuous beam of X-rays to create real-time images of the inside of the body.', 'RF'),
    (9, 'Angiography', 'A type of X-ray used to create images of the blood vessels.', 'XA'),
    (10, 'Interventional radiology', 'A type of imaging used to guide minimally invasive procedures, such as biopsies and catheter insertions.', 'XA'),
    (11, 'Nuclear medicine', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (12, 'Magnetic resonance angiography (MRA)', 'A type of MRI used to create images of the blood vessels.', 'MR'),
    (13, 'Computed tomography angiography (CTA)', 'A type of CT scan used to create images of the blood vessels.', 'CT'),
    (14, 'Positron emission tomography (PET)', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'PT'),
    (15, 'Single-photon emission computed tomography (SPECT)', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (16, 'Sestamibi', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (22, 'Thyroid scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (23, 'Parathyroid scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (24, 'Renal scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (25, 'HIDA scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (26, 'MUGA scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (27, 'Bone marrow scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (29, 'Red blood cell scan', 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', 'NM'),
    (30, 'Other CT', 'Other CT imaging studies not listed', 'CT'),
    (31, 'Other MR', 'Other MR imaging studies not listed', 'MR'),
    (32, 'Other NM', 'Other NM imaging studies not listed', 'NM'),
    (33, 'Other US', 'Other US imaging studies not listed', 'US'),
    (34, 'Other XA', 'Other XA imaging studies not listed', 'XA'),
    (35, 'Other MG', 'Other MG imaging studies not listed', 'MG'),
    (36, 'Other RF', 'Other RF imaging studies not listed', 'RF'),
    (37, 'Other CR', 'Other CR imaging studies not listed', 'CR'),
    (38, 'Other PT', 'Other PT imaging studies not listed', 'PT');

    
CREATE TABLE patient_imaging_diagnoses (
    imaging_id UUID NOT NULL
    references patient_imaging,
    patient_id UUID NOT NULL
    references patients,
    diagnosis_id UUID NOT NULL
    references diagnoses,
    primary key (imaging_id, patient_id, diagnosis_id)
);

ALTER TABLE patient_imaging
ADD COLUMN metadata JSONB DEFAULT '{"locations": []}';

ALTER TABLE patient_imaging
ADD COLUMN modality_id INT REFERENCES imaging_types(id);


ALTER TABLE provider_attachments
ADD COLUMN patient_id UUID REFERENCES patients(id);

ALTER TABLE institutions_attachments
ADD COLUMN patient_id UUID REFERENCES patients(id);

ALTER TABLE medications_attachments
ADD COLUMN patient_id UUID references patients(id);

ALTER TABLE interventions_attachments
ADD COLUMN patient_id UUID references patients(id);

ALTER TABLE institutions_attachments
RENAME COLUMN institutions_id TO institution_id;
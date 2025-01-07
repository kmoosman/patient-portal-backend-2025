BEGIN;
create table cancers
(
    id serial primary key,
    title varchar(500) not null,
    organ varchar(250),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create table cancer_subtypes
(
    id serial primary key,
    title varchar(500) not null,
    cancer_id int not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp,
    foreign key (cancer_id) references cancers(id)
);


insert into cancers(title) values('Acute Lymphoblastic Leukemia');
insert into cancers(title) values('Acute Myeloid Leukemia');
insert into cancers(title) values('Adrenal Cancer');
insert into cancers(title) values('Anal Cancer');
insert into cancers(title) values('Appendix Cancer');
insert into cancers(title) values('Bile Duct Cancer');
insert into cancers(title) values('Bladder Cancer');
insert into cancers(title) values('Bone Cancer');
insert into cancers(title) values('Brain Cancer');
insert into cancers(title) values('Breast Cancer');
insert into cancers(title) values('Cervical Cancer');
insert into cancers(title) values('Chronic Lymphocytic Leukemia');
insert into cancers(title) values('Chronic Myeloid Leukemia');
insert into cancers(title) values('Colon Cancer');
insert into cancers(title) values('Colorectal Cancer');
insert into cancers(title) values('Esophageal Cancer');
insert into cancers(title) values('Eye Cancer');
insert into cancers(title) values('Fallopian Tube Cancer');
insert into cancers(title) values('Gallbladder Cancer');
insert into cancers(title) values('Gestational Trophoblastic Disease');
insert into cancers(title) values('Head and Neck Cancer');
insert into cancers(title) values('Hodgkin Lymphoma');
insert into cancers(title) values('Kidney Cancer');
insert into cancers(title) values('Laryngeal and Hypopharyngeal Cancer');
insert into cancers(title) values('Leukemia');
insert into cancers(title) values('Liver Cancer');
insert into cancers(title) values('Lung Cancer');
insert into cancers(title) values('Lymphoma');
insert into cancers(title) values('Melanoma');
insert into cancers(title) values('Mesothelioma');
insert into cancers(title) values('Multiple Myeloma');
insert into cancers(title) values('Myelodysplastic Syndrome');
insert into cancers(title) values('Nasal Cavity and Paranasal Sinus Cancer');
insert into cancers(title) values('Nasopharyngeal Cancer');
insert into cancers(title) values('Neuroblastoma');
insert into cancers(title) values('Non-Hodgkin Lymphoma');
insert into cancers(title) values('Non-Small Cell Lung Cancer');
insert into cancers(title) values('Oral Cancer');
insert into cancers(title) values('Ovarian Cancer');
insert into cancers(title) values('Pancreatic Cancer');
insert into cancers(title) values('Penile Cancer');
insert into cancers(title) values('Pituitary Tumors');
insert into cancers(title) values('Prostate Cancer');
insert into cancers(title) values('Rectal Cancer');
insert into cancers(title) values('Retinoblastoma');
insert into cancers(title) values('Rhabdomyosarcoma');
insert into cancers(title) values('Salivary Gland Cancer');
insert into cancers(title) values('Sarcoma');
insert into cancers(title) values('Skin Cancer');
insert into cancers(title) values('Small Cell Lung Cancer');
insert into cancers(title) values('Small Intestine Cancer');
insert into cancers(title) values('Soft Tissue Sarcoma');
insert into cancers(title) values('Stomach Cancer');
insert into cancers(title) values('Testicular Cancer');
insert into cancers(title) values('Thymus Cancer');
insert into cancers(title) values('Thyroid Cancer');
insert into cancers(title) values('Uterine Cancer');
insert into cancers(title) values('Vaginal Cancer');
insert into cancers(title) values('Vulvar Cancer');
insert into cancers(title) values('Waldenstrom Macroglobulinemia');
insert into cancers(title) values('Wilms Tumor');


INSERT INTO cancer_subtypes (title, cancer_id)
SELECT title, (SELECT id FROM cancers WHERE title = 'Kidney Cancer')
FROM (VALUES 
    ('Chromophobe Renal Cell Carcinoma'),
    ('Collecting Duct Carcinoma'),
    ('Renal Medullary Carcinoma'),
    ('Papillary Renal Cell Carcinoma'),
    ('Unclassified Renal Cell Carcinoma'),
    ('Sarcomatoid Renal Cell Carcinoma'),
    ('Tubulocystic Renal Cell Carcinoma'),
    ('Xp11 Translocation Renal Cell Carcinoma'),
    ('MiTF/TFE Translocation Renal Cell Carcinoma'),
    ('SDH Renal Cell Carcinoma'),
    ('HLRCC Renal Cell Carcinoma'),
    ('Oncocytoma')
) AS v(title);


CREATE TABLE cancer_attributes (
    attribute_id SERIAL PRIMARY KEY,
    cancer_id INT NOT NULL,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value VARCHAR(255),
    FOREIGN KEY (cancer_id) REFERENCES cancers(id)
);


CREATE TABLE cancer_subtype_attributes (
    attribute_id SERIAL PRIMARY KEY,
    subtype_id INT NOT NULL,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value VARCHAR(255),
    FOREIGN KEY (subtype_id) REFERENCES cancer_subtypes(id)
);

ALTER TABLE diagnoses
ADD COLUMN attributes JSON; 

-- create table for synynoms of cancer types
CREATE TABLE cancer_synonyms (
    id SERIAL PRIMARY KEY,
    cancer_id INT NOT NULL,
    synonym VARCHAR(255) NOT NULL,
    FOREIGN KEY (cancer_id) REFERENCES cancers(id)
);

-- create table for synynoms of cancer subtypes
CREATE TABLE cancer_subtype_synonyms (
    id SERIAL PRIMARY KEY,
    subtype_id INT NOT NULL,
    synonym VARCHAR(255) NOT NULL,
    FOREIGN KEY (subtype_id) REFERENCES cancer_subtypes(id)
);

-- general attributes to be used across all types
INSERT INTO public.cancer_attributes (cancer_id, attribute_name, attribute_value) 
VALUES 
    (0, 'stage', 'text'),
    (0, 'grade', 'text'),
    (0, 'primary_initial_size', 'integer'),
    (0, 'primary_current_size', 'integer'),
    (0, 'size_units', 'integer');



commit;
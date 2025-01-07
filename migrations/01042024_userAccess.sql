CREATE TABLE access_levels (
    level_id INT PRIMARY KEY,
    level_name VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO access_levels (level_id, level_name, description) VALUES
(0, 'Private', 'Only the user who created it can see these items.'),
(0, 'Providers and Research', 'Full access to everything that is not private.'),
(0, 'Emergency Access', 'Access to a subset of information for emergency situations.'),
(0, 'Social Media', 'Access to a smaller subset of information for social media purposes.'),
(0, 'Public', 'Information available to the general public.');

ALTER TABLE patient_medications
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE attachments
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE diagnoses
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);


ALTER TABLE patient_institutions
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);


ALTER TABLE patient_interventions
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);


ALTER TABLE patient_providers
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE diagnoses_links
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE intervention_links
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE lab_results
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE patient_appointments
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE patient_imaging
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE research_interests
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE research_links
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE research_notations
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE side_effect_attachments
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE side_effects_symptoms
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE timeline_event_links
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE timeline_events
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE tissue_locations
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE patient_family_history
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);


CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

ALTER TABLE research_interests
DROP COLUMN visibility;

CREATE TABLE patient_user_access (
    patient_id UUID NOT NULL,
    user_id UUID NOT NULL,
    access_level_id INT NOT NULL,
    clerk_id VARCHAR,
    PRIMARY KEY (patient_id, user_id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id)
);

ALTER TABLE patient_medications
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE patient_family_history
ADD COLUMN access_level_id INT DEFAULT 0,
ADD FOREIGN KEY (access_level_id) REFERENCES access_levels(level_id);

ALTER TABLE patient_medications
ADD COLUMN units varchar(50);

ALTER TABLE patient_medications
ADD COLUMN alternative boolean;

ALTER TABLE patient_medications
ADD COLUMN frequency integer;

ALTER TABLE patient_medications
ADD COLUMN interval varchar(100);

ALTER TABLE providers
ADD COLUMN npi VARCHAR(50);

ALTER TABLE users
ADD COLUMN clerk_id VARCHAR(100)

ALTER TABLE diagnoses
ADD COLUMN color VARCHAR(50);

ALTER TABLE diagnoses
ADD COLUMN pub_med_keywords VARCHAR(500);

ALTER TABLE diagnoses
ADD COLUMN clinical_trials_keywords VARCHAR(500);

ALTER TABLE diagnoses
ADD COLUMN highlighted boolean;

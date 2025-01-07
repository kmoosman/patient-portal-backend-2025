ALTER TABLE medications
ADD COLUMN reason_discontinued VARCHAR(250);

ALTER TABLE medications
ADD COLUMN discontinued_notes text;

CREATE TABLE medication_administered_date (
    patient_id UUID NOT NULL,
    medication_id UUID NOT NULL,
    patient_medication_id INT NOT NULL,
    PRIMARY KEY (patient_medication_id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (medication_id) REFERENCES medications(id)
);

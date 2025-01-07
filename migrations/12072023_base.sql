create table tags
(
    id       serial
        primary key,
    tag_name varchar(255),
    category varchar(255)
);


create table providers
(
    id                 uuid not null
        constraint providers_lookup_pkey
            primary key,
    first_name         varchar(100),
    last_name          varchar(100),
    designation        varchar(50),
    specialization     varchar(250),
    sub_specialization varchar(250),
    middle_initial     varchar(1)
);


create table provider_tags
(
    provider_id uuid    not null
        references providers,
    tag_id      integer not null
        references tags,
    primary key (provider_id, tag_id)
);


create table providers_staff
(
    provider_id uuid not null
        references providers,
    id          uuid not null,
    first_name  varchar(100),
    last_name   varchar(100),
    title       varchar(250),
    primary key (provider_id, id)
);

create table patients
(
    id                         uuid not null
        primary key,
    address_1                  varchar(255),
    address_2                  varchar(255),
    city                       varchar(500),
    state                      varchar(500),
    country                    varchar(500),
    postal_code                varchar(50),
    image                      text,
    email                      varchar(250),
    phone                      varchar(100),
    cell                       varchar(100),
    summary                    text,
    notes                      text,
    first_name                 varchar(100),
    last_name                  varchar(100),
    dob                        date,
    emergency_contact_name     varchar(255),
    emergency_contact_phone    varchar(50),
    emergency_contact_email    varchar(500),
    emergency_contact_relation varchar(255)
);


create table diagnoses
(
    id             uuid not null
        primary key,
    start_date     date,
    title          varchar(255),
    category       varchar(100),
    type           varchar(100),
    subtype        varchar(100),
    stage          varchar(50),
    grade          varchar(50),
    primary_size   numeric,
    current_size   numeric,
    size_units     varchar(50),
    status         varchar(100),
    disease_status varchar(100),
    notes          text,
    end_date       date,
    validated      boolean,
    patient_id     uuid
        references patients
);


create table diagnosis_tags
(
    diagnosis_id uuid    not null
        references diagnoses,
    tag_id       integer not null
        references tags,
    primary key (diagnosis_id, tag_id)
);


create table patient_providers
(
    id              uuid not null
        primary key,
    patient_id      uuid
        references patients,
    provider_id     uuid
        references providers,
    start_date      date,
    end_date        date,
    status          varchar(100),
    address_1       varchar(255),
    address_2       varchar(255),
    city            varchar(500),
    state           varchar(500),
    country         varchar(500),
    postal_code     varchar(50),
    image           text,
    link            text,
    list_order      integer,
    role            varchar(100),
    title           varchar(100),
    email           varchar(250),
    fax             varchar(100),
    cell            varchar(100),
    phone           varchar(100),
    nurses_line     varchar(100),
    after_hours     varchar(100),
    notes           text,
    internal_notes  text,
    primary_contact boolean
);


create table institutions
(
    id          uuid not null
        primary key,
    title       varchar(250),
    image       text,
    address_1   varchar(255),
    address_2   varchar(255),
    city        varchar(500),
    state       varchar(500),
    country     varchar(500),
    postal_code varchar(50)
);

create table patient_institutions
(
    id                   uuid not null
        primary key,
    patient_id           uuid
        references patients,
    institution_id       uuid
        constraint patient_institutions_provider_id_fkey
            references institutions,
    records_office_email varchar(250),
    records_office_phone varchar(255),
    internal_notes       varchar(255),
    notes                varchar(255),
    list_order           integer,
    status               varchar(50)
);

create table patient_institution_diagnosis
(
    patient_id     uuid not null
        references patients,
    institution_id uuid not null
        references institutions,
    diagnosis_id   uuid not null
        references diagnoses,
    primary key (patient_id, institution_id, diagnosis_id)
);


create table patient_provider_diagnosis
(
    patient_id   uuid not null
        references patients,
    provider_id  uuid not null
        references providers,
    diagnosis_id uuid not null
        references diagnoses,
    primary key (patient_id, provider_id, diagnosis_id)
);

create table provider_institution
(
    provider_id    uuid not null
        references providers,
    institution_id uuid not null
        references institutions,
    primary key (provider_id, institution_id)
);

create table patient_interventions
(
    id             uuid not null
        constraint interventions_pkey
            primary key,
    title          varchar(255),
    reason         varchar(500),
    category       varchar(255),
    result         text,
    organs         text,
    start_date     date,
    end_date       date,
    days_admitted  integer,
    notes          text,
    institution_id uuid
        references institutions,
    diagnosis_id   uuid
        references diagnoses,
    patient_id     uuid
        references patients,
    list_order     integer
);

create table intervention_tags
(
    intervention_id uuid    not null
        references patient_interventions,
    tag_id          integer not null
        references tags,
    primary key (intervention_id, tag_id)
);

create table patient_intervention_providers
(
    intervention_id uuid not null
        references patient_interventions,
    provider_id     uuid not null
        references providers,
    patient_id      uuid
        references patients,
    primary key (intervention_id, provider_id)
);

create table medications
(
    id           uuid not null
        primary key,
    manufacturer varchar(255),
    title        varchar(255),
    category     varchar(255),
    tags         text
);

create table patient_medications
(
    id                   uuid not null
        primary key,
    title                varchar(255),
    prescribing_provider uuid
        references providers,
    start_date           date,
    end_date             date,
    status               varchar(50),
    dosage               varchar(100),
    notes                text,
    diagnosis            uuid
        references diagnoses,
    reason               text,
    medication_id        uuid
        references medications,
    patient_id           uuid
        references patients,
    list_order           integer
);


create table side_effects_symptoms
(
    id          uuid not null
        constraint side_effects_pkey
            primary key,
    title       text,
    description text,
    tags        text
);


create table patient_medication_side_effects
(
    medication_id  uuid not null
        references medications,
    side_effect_id uuid not null
        references side_effects_symptoms,
    patient_id     uuid not null
        references patients,
    severity       varchar(100),
    notes          text,
    start_date     date,
    end_date       date,
    list_order     integer,
    primary key (medication_id, side_effect_id, patient_id)
);


create table patient_imaging
(
    id                uuid not null
        constraint imaging_pkey
            primary key,
    patient_id        uuid
        constraint imaging_patient_id_fkey
            references patients,
    title             varchar(255),
    category          varchar(255),
    reason            text,
    ordering_provider uuid
        constraint imaging_ordering_provider_fkey
            references providers,
    start_date        date,
    end_date          date,
    report            text,
    status            varchar(255),
    impression        text,
    institution_id    uuid
        constraint imaging_institution_id_fkey
            references institutions,
    verified          boolean,
    notes             text,
    list_order        integer,
    diagnosis_id      uuid
        references diagnoses
);

create table attachments
(
    id             uuid not null
        primary key,
    patient_id     uuid
        references patients,
    link           text,
    title          text,
    start_date     date,
    institution_id uuid
        references institutions,
    notes          text,
    category       varchar(100),
    highlight      boolean
);


create table diagnoses_attachments
(
    diagnosis_id  uuid not null
        references diagnoses,
    attachment_id uuid not null,
    primary key (attachment_id, diagnosis_id)
);

create table interventions_attachments
(
    intervention_id uuid not null
        references patient_interventions,
    attachment_id   uuid not null,
    primary key (attachment_id, intervention_id)
);

create table imaging_attachments
(
    imaging_id    uuid not null
        references patient_imaging,
    attachment_id uuid not null,
    primary key (attachment_id, imaging_id)
);

create table institutions_attachments
(
    institutions_id uuid not null
        references institutions,
    attachment_id   uuid not null,
    primary key (attachment_id, institutions_id)
);

create table side_effect_attachments
(
    diagnosis_id  uuid not null
        references side_effects_symptoms,
    attachment_id uuid not null,
    primary key (attachment_id, diagnosis_id)
);


create table provider_attachments
(
    provider_id   uuid not null
        references providers,
    attachment_id uuid not null,
    primary key (attachment_id, provider_id)
);


create table medication_links
(
    id            uuid not null
        primary key,
    medication_id uuid
        references patient_medications,
    link          text,
    title         varchar(255),
    category      varchar(100),
    description   varchar(500),
    notes         text
);

create table medications_attachments
(
    medication_id uuid not null
        references patient_medications,
    attachment_id uuid not null,
    primary key (attachment_id, medication_id)
);


create table medications_relations
(
    patient_medication_id        uuid not null
        references patient_medications,
    linked_patient_medication_id uuid not null
        references patient_medications,
    primary key (patient_medication_id, linked_patient_medication_id)
);


create table intervention_links
(
    id              uuid not null
        primary key,
    intervention_id uuid
        references patient_interventions,
    link            text,
    title           varchar(255),
    category        varchar(100),
    description     varchar(500),
    notes           text
);

create table diagnoses_links
(
    id           uuid not null
        primary key,
    diagnosis_id uuid
        references diagnoses,
    link         text,
    title        varchar(255),
    category     varchar(100),
    description  varchar(500),
    notes        text
);


create table tissue_locations
(
    id             uuid not null
        primary key,
    patient_id     uuid
        references patients,
    title          varchar(500),
    quantity       text,
    notes          text,
    institution_id uuid
        references institutions,
    diagnosis_id   uuid
        references diagnoses
);


create table timeline_events
(
    id          uuid not null
        primary key,
    patient_id  uuid
        references patients,
    title       varchar(500),
    reason      varchar(100),
    description varchar(250),
    category    varchar(250),
    notes       text,
    start_date  date,
    end_date    date
);


create table timeline_event_links
(
    id                uuid not null
        primary key,
    timeline_event_id uuid
        references timeline_events,
    link              text,
    title             varchar(255),
    category          varchar(100),
    description       varchar(500),
    notes             text
);


create table patient_appointments
(
    id             uuid not null
        primary key,
    patient_id     uuid
        references patients,
    title          text,
    category       varchar(250),
    reason         varchar(500),
    provider_id    uuid
        references providers,
    institution_id uuid
        references institutions,
    notes          text,
    start_date     date,
    time           timestamp,
    end_date       date
);

create table patient_appointment_diagnoses
(
    appointment_id uuid not null
        references patient_appointments,
    diagnosis_id   uuid not null
        references diagnoses,
    primary key (appointment_id, diagnosis_id)
);


create table patient_family_history
(
    id                      uuid not null
        primary key,
    patient_id              uuid
        references patients,
    family_member_relation  text,
    family_member_history   varchar(500),
    family_member_notes     text,
    family_age_at_diagnosis integer,
    start_date              date,
    category                varchar(250),
    list_order              integer
);


create table lab_results
(
    id                   uuid not null
        primary key,
    patient_id           uuid
        references patients,
    panel                varchar(250),
    items_tested         varchar(500),
    title                varchar(300),
    value                numeric,
    units                varchar(100),
    reference_range_high numeric,
    reference_range_low  numeric,
    start_date           date,
    panel_id             uuid,
    highlighted          boolean,
    institution_id       uuid
        references institutions,
    notes                text
);

create table roles
(
    id        serial
        primary key,
    role_name varchar(50) not null
        unique
);

create table user_roles
(
    id          uuid
        references patients,
    role_id     integer
        references roles,
    auth_emails varchar(300)
);


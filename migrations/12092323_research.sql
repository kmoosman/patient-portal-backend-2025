create table research_interests
(
    id              uuid not null
        constraint research_interest_pkey
            primary key,
    title           varchar,
    description     varchar(500),
    notes           varchar,
    category        varchar(250),
    status          varchar(250),
    start_date      date,
    end_date        date,
    created_at      timestamp default CURRENT_TIMESTAMP,
    diagnosis       uuid
        constraint research_interest_diagnosis_fkey
            references diagnoses,
    patient_id      uuid
        constraint research_interest_patient_id_fkey
            references patients,
    pubmed_keywords varchar
);

create table research_links
(
    id                   uuid not null
        primary key,
    research_interest_id uuid
        references research_interests,
    title                varchar,
    link                 varchar,
    description          varchar(500),
    notes                varchar,
    category             varchar(250),
    status               varchar(250),
    highlighted          boolean,
    start_date           date,
    visibility           varchar(250),
    created_at           timestamp default CURRENT_TIMESTAMP
);


create table research_notations
(
    id                   uuid                                not null
        primary key,
    research_interest_id uuid
        references research_interests,
    title                varchar,
    description          varchar(500),
    notes                varchar,
    category             varchar(250),
    status               varchar(250),
    highlighted          boolean,
    created_at           timestamp default CURRENT_TIMESTAMP not null,
    updated_at           timestamp default CURRENT_TIMESTAMP not null
);

CREATE TABLE research_interest_users
(
    research_interest_id uuid not null
        references research_interests,
    user_id              uuid not null
        references patients
);

CREATE TABLE research_notation_threads (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    notation_id UUID NOT NULL,
    access_level INT NOT NULL DEFAULT 4,
    comment text,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    update_at timestamp default CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (notation_id) REFERENCES research_notations(id)
);

CREATE INDEX idx_user_id ON research_notation_threads(user_id);
CREATE INDEX idx_notation_id ON research_notation_threads(notation_id);
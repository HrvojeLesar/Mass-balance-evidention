CREATE TABLE dispatch_note (
    id SERIAL PRIMARY KEY,
    type INT,
    numerical_identifier INT,
    issuing_date TIMESTAMPTZ,
    d_group INT REFERENCES data_group(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE article (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    d_group INT REFERENCES data_group(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE weight_types RENAME TO measure;
ALTER TABLE entry DROP COLUMN weight_type;
ALTER TABLE entry ADD measure VARCHAR(5) REFERENCES measure(id) DEFAULT 'kg';

CREATE TABLE dispatch_note_article (
    id_dispatch_note INT REFERENCES dispatch_note(id) NOT NULL,
    id_article INT REFERENCES article(id) NOT NULL,
    id_measure VARCHAR(5) REFERENCES measure(id) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

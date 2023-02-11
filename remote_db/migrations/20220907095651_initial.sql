CREATE TABLE data_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
-- INSERT INTO data_group (id, name, description) VALUES (1, 'DEFAULT', 'Row for satisfying NOT NULL constraints on altered tables. Should only be used for default and changed.');
-- Fixes manual data_group insertion
-- SELECT nextval('data_group_id_seq');

CREATE TABLE cell (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE culture (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE buyer (
    id SERIAL PRIMARY KEY,
    name TEXT,
    address TEXT,
    contact TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE cell_culture_pair (
    id SERIAL PRIMARY KEY,
    id_cell INT REFERENCES cell(id) NOT NULL,
    id_culture INT REFERENCES culture(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (id_cell, id_culture, d_group),
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE weight_types (
    id VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50)
);

INSERT INTO weight_types (id, name)
VALUES
    ('g', 'gram'),
    ('kg', 'kilogram');

CREATE TABLE entry (
    id SERIAL PRIMARY KEY,
    weight DOUBLE PRECISION,
    weight_type VARCHAR(5) REFERENCES weight_types(id) DEFAULT 'kg',
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_buyer INT REFERENCES buyer(id) NOT NULL,
    id_cell_culture_pair INT REFERENCES cell_culture_pair(id) NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE dispatch_note (
    id SERIAL PRIMARY KEY,
    note_type INT,
    numerical_identifier INT,
    issuing_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE article (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

CREATE TABLE dispatch_note_article (
    id SERIAL PRIMARY KEY,
    id_dispatch_note INT REFERENCES dispatch_note(id) ON DELETE CASCADE NOT NULL,
    id_article INT REFERENCES article(id) NOT NULL,
    weight_type VARCHAR(5) REFERENCES weight_types(id) DEFAULT 'kg',
    quantity DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL
);

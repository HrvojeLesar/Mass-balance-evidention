CREATE TABLE cell (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE culture (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE cell_culture_pair (
    id_cell INT REFERENCES cell(id),
    id_culture INT REFERENCES culture(id),
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id_cell, id_culture)
);

CREATE TABLE weight_types (
    id VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50)
);

INSERT INTO weight_types (id, name)
VALUES
    ('g', 'gram'),
    ('kg', 'kilogram');

CREATE TABLE buyer (
    id SERIAL PRIMARY KEY,
    name TEXT,
    address TEXT,
    contact TEXT,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE entry (
    id SERIAL PRIMARY KEY,
    weight DOUBLE PRECISION,
    weight_type VARCHAR(5) REFERENCES weight_types(id) DEFAULT 'kg',
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_buyer INT REFERENCES buyer(id),
    id_cell INT,
    id_culture INT,
    FOREIGN KEY(id_cell, id_culture) REFERENCES cell_culture_pair(id_cell, id_culture)
);

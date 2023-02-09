CREATE TABLE data_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO data_group (id, name, description) VALUES (1, 'DEFAULT', 'Row for satisfying NOT NULL constraints on altered tables. Should only be used for default and changed.');

ALTER TABLE cell ADD COLUMN d_group INT REFERENCES data_group(id);
ALTER TABLE culture ADD COLUMN d_group INT REFERENCES data_group(id);
ALTER TABLE buyer ADD COLUMN d_group INT REFERENCES data_group(id);

ALTER TABLE cell_culture_pair ADD COLUMN d_group INT REFERENCES data_group(id) NOT NULL DEFAULT 1;
ALTER TABLE cell_culture_pair DROP CONSTRAINT cell_culture_pair_pkey CASCADE;
ALTER TABLE cell_culture_pair ADD PRIMARY KEY (id_cell, id_culture, d_group);

ALTER TABLE entry ADD COLUMN d_group INT REFERENCES data_group(id);
ALTER TABLE entry ADD COLUMN ccp_d_group INT NOT NULL DEFAULT 1;
ALTER TABLE entry
ADD FOREIGN KEY(id_cell, id_culture, ccp_d_group)
    REFERENCES cell_culture_pair (id_cell, id_culture, d_group)
    ON UPDATE CASCADE;

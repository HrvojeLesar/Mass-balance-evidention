-- WARN: Unused
-- CREATE TABLE metric_prefixes(
--     id SERIAL PRIMARY KEY,
--     prefix VARCHAR(8) NOT NULL,
--     symbol VARCHAR(8) NOT NULL,
--     power_of INT NOT NULL
-- );

-- WARN: Unused
-- INSERT INTO metric_prefixes (prefix, symbol, power_of)
-- VALUES
--     ('tera',  'T',    12),
--     ('giga',  'G',    9),
--     ('mega',  'M',    6),
--     ('kilo',  'k',    3),
--     ('hecto', 'h',    2),
--     ('deca',  'da',   1),
--     ('base',  'base', 0),
--     ('deci',  'd',    -1),
--     ('centi', 'c',    -2),
--     ('milli', 'm',    -3),
--     ('micro', 'μ',    -6),
--     ('nano',  'n',    -9),
--     ('pico',  'p',    -12)

-- CREATE TABLE weight_types (
--     id SERIAL PRIMARY KEY,
--     unit VARCHAR(50) NOT NULL,
--     is_metric BOOLEAN DEFAULT TRUE NOT NULL,
--     metric_prefix INT REFERENCES metrix_prefixes,
-- );

CREATE TABLE weight_type(
    id SERIAL PRIMARY KEY,
    unit_short VARCHAR(32) NOT NULL,
    unit VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE mbe_groups_weight_types(
    id_weight_type INT REFERENCES weight_type(id) NOT NULL,
    id_created_by INT REFERENCES mbe_user(id) NOT NULL,
    id_mbe_group INT REFERENCES mbe_group(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (id_weight_type, id_created_by, id_mbe_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON mbe_groups_weight_types(id_mbe_group);

ALTER TABLE entry DROP COLUMN weight_type;
-- WARN: Doesn't work on an non empty database
ALTER TABLE entry ADD COLUMN weight_type INT REFERENCES weight_type(id) NOT NULL;

ALTER TABLE dispatch_note_article DROP COLUMN weight_type;
-- WARN: Doesn't work on an non empty database
ALTER TABLE dispatch_note_article ADD COLUMN weight_type INT REFERENCES weight_type(id) NOT NULL;

DROP TABLE weight_types CASCADE;

CREATE TABLE d_group_cell (
    id_cell INT REFERENCES cell(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_cell, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_cell(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_cell(id_cell, id_d_group) SELECT id, d_group FROM cell;
    ALTER TABLE cell DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_culture (
    id_culture INT REFERENCES culture(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_culture, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_culture(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_culture(id_culture, id_d_group) SELECT id, d_group FROM culture;
    ALTER TABLE culture DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_buyer (
    id_buyer INT REFERENCES buyer(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_buyer, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_buyer(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_buyer(id_buyer, id_d_group) SELECT id, d_group FROM buyer;
    ALTER TABLE buyer DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_cell_culture_pair (
    id_cell_culture_pair INT REFERENCES cell_culture_pair(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_cell_culture_pair, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_cell_culture_pair(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_cell_culture_pair(id_cell_culture_pair, id_d_group) SELECT id, d_group FROM cell_culture_pair;
    ALTER TABLE cell_culture_pair DROP CONSTRAINT cell_culture_pair_id_cell_id_culture_d_group_key;
    ALTER TABLE cell_culture_pair ADD CONSTRAINT cell_culture_pair_id_cell_id_culture_d_group_key UNIQUE(id_cell, id_culture);
    ALTER TABLE cell_culture_pair DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_entry (
    id_entry INT REFERENCES entry(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_entry, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_entry(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_entry(id_entry, id_d_group) SELECT id, d_group FROM entry;
    ALTER TABLE entry DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_dispatch_note (
    id_dispatch_note INT REFERENCES dispatch_note(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_dispatch_note, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_dispatch_note(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_dispatch_note(id_dispatch_note, id_d_group) SELECT id, d_group FROM dispatch_note;
    ALTER TABLE dispatch_note DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_article (
    id_article INT REFERENCES article(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_article, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_article(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_article(id_article, id_d_group) SELECT id, d_group FROM article;
    ALTER TABLE article DROP COLUMN d_group;
COMMIT;

CREATE TABLE d_group_dispatch_note_article (
    id_dispatch_note_article INT REFERENCES dispatch_note_article(id),
    id_d_group INT REFERENCES data_group(id),
    PRIMARY KEY (id_dispatch_note_article, id_d_group),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ON d_group_dispatch_note_article(id_d_group);
BEGIN TRANSACTION;
    INSERT INTO d_group_dispatch_note_article(id_dispatch_note_article, id_d_group) SELECT id, d_group FROM dispatch_note_article;
    ALTER TABLE dispatch_note_article DROP COLUMN d_group;
COMMIT;

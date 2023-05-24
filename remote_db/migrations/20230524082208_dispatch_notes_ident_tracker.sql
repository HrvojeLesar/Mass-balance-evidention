CREATE TABLE dispatch_note_ident_tracker(
    id_data_group INT REFERENCES data_group(id) PRIMARY KEY,
    identifier INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

BEGIN;
    INSERT INTO dispatch_note_ident_tracker SELECT id FROM data_group;
END;

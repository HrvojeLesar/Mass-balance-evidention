CREATE TABLE mbe_user(
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX mbe_user_email_index ON mbe_user(email);

CREATE TABLE mbe_group(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner INT REFERENCES mbe_user(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE mbe_group_members(
    id_mbe_user INT REFERENCES mbe_user(id) NOT NULL,
    id_mbe_group INT REFERENCES mbe_group(id) NOT NULL,
    PRIMARY KEY (id_mbe_user, id_mbe_group)
);

ALTER TABLE data_group ADD COLUMN id_mbe_group INT REFERENCES mbe_group(id) NOT NULL;
-- ALTER TABLE weight_type ADD COLUMN id_mbe_group INT REFERENCES mbe_groupd(id) NOT NULL;

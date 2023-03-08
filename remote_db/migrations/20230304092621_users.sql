CREATE TABLE mbe_user(
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX mbe_user_email_index ON mbe_user(email);

CREATE TABLE mbe_group(
    id SERIAL PRIMARY KEY,
    owner INT REFERENCES mbe_user(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE mbe_group_allowed_data_groups(
    id_mbe_group INT REFERENCES mbe_group(id) NOT NULL,
    d_group INT REFERENCES data_group(id) NOT NULL,
    PRIMARY KEY (id_mbe_group, d_group)
);

CREATE TABLE mbe_group_members(
    id_mbe_user INT REFERENCES mbe_user(id) NOT NULL,
    id_mbe_group INT REFERENCES mbe_group(id) NOT NULL,
    PRIMARY KEY (id_mbe_user, id_mbe_group)
);

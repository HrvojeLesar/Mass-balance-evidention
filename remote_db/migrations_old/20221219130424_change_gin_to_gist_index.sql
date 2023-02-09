DROP INDEX cell_name_trgm_idx;
DROP INDEX cell_description_trgm_idx;

DROP INDEX culture_name_trgm_idx;
DROP INDEX culture_description_trgm_idx;

DROP INDEX buyer_name_trgm_idx;
DROP INDEX buyer_address_trgm_idx;
DROP INDEX buyer_contact_trgm_idx;

CREATE INDEX cell_name_trgm_idx ON cell USING GIST (name gist_trgm_ops);
CREATE INDEX cell_description_trgm_idx ON cell USING GIST (description gist_trgm_ops);

CREATE INDEX culture_name_trgm_idx ON culture USING GIST (name gist_trgm_ops);
CREATE INDEX culture_description_trgm_idx ON culture USING GIST (description gist_trgm_ops);

CREATE INDEX buyer_name_trgm_idx ON buyer USING GIST (name gist_trgm_ops);
CREATE INDEX buyer_address_trgm_idx ON buyer USING GIST (address gist_trgm_ops);
CREATE INDEX buyer_contact_trgm_idx ON buyer USING GIST (contact gist_trgm_ops);

-- Fixes manual data_group insertion in 20221016102952_segragation.sql
SELECT nextval('data_group_id_seq');

CREATE INDEX cell_name_trgm_idx ON cell USING GIN (name gin_trgm_ops);
CREATE INDEX cell_description_trgm_idx ON cell USING GIN (description gin_trgm_ops);

CREATE INDEX culture_name_trgm_idx ON culture USING GIN (name gin_trgm_ops);
CREATE INDEX culture_description_trgm_idx ON culture USING GIN (description gin_trgm_ops);

CREATE INDEX buyer_name_trgm_idx ON buyer USING GIN (name gin_trgm_ops);
CREATE INDEX buyer_address_trgm_idx ON buyer USING GIN (address gin_trgm_ops);
CREATE INDEX buyer_contact_trgm_idx ON buyer USING GIN (contact gin_trgm_ops);

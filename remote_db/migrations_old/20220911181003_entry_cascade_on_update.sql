ALTER TABLE entry 
DROP CONSTRAINT entry_id_cell_id_culture_fkey;

ALTER TABLE entry
ADD FOREIGN KEY(id_cell, id_culture) 
    REFERENCES cell_culture_pair (id_cell, id_culture) 
    ON UPDATE CASCADE;

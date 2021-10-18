// cx.export_function('getEntries', get_entries)?;                          -
// cx.export_function('getCells', get_cells)?;                              +
// cx.export_function('getCultures', get_cultures)?;                        +
// cx.export_function('getCellsCultures', get_cell_cultures)?;              -
// cx.export_function('getBuyers', get_buyers)?;                            +
// cx.export_function('insertEntry', insert_entry)?;                        -
// cx.export_function('insertCell', insert_cell)?;                          -
// cx.export_function('insertCulture', insert_culture)?;                    -
// cx.export_function('insertCellCulture', insert_cell_culture)?;           -
// cx.export_function('insertBuyer', insert_buyer)?;                        -
// cx.export_function('deleteEntry', delete_entry)?;                        +
// cx.export_function('deleteCell', delete_cell)?;                          +
// cx.export_function('deleteCulture', delete_culture)?;                    +
// cx.export_function('deleteCellCulture', delete_cell_culture)?;           +
// cx.export_function('deleteBuyer', delete_buyer)?;                        +
// cx.export_function('updateEntry', update_entry)?;                        +
// cx.export_function('updateCell', update_cell)?;                          +
// cx.export_function('updateCulture', update_culture)?;                    +
// cx.export_function('updateCellCulture', update_cell_culture)?;           +
// cx.export_function('updateBuyer', update_buyer)?;                        +
// cx.export_function('getCellsByCulture', get_cells_by_culture)?;          -
// cx.export_function('runMigrations', run_migrations)?;                    *
// cx.export_function('changeDatabase', change_database)?;                  *

export enum SELECTALL {
  CELLS = 'SELECT * FROM cestica',
  CULTURES = 'SELECT * FROM kultura',
  BUYERS = 'SELECT * FROM kupci',
  CELLCULTURES = 'SELECT id_cestica, cestica.naziv as cNaziv, id_kultura, kultura.naziv as kNaziv FROM cestica_kultura JOIN cestica ON id_cestica = cestica.id JOIN kultura ON id_kultura = kultura.id',
  ENTRY = 'SELECT zapisi.id, zapisi.datum, zapisi.tezina, zapisi.id_cestica, zapisi.id_kultura, zapisi.id_kupac, cestica.naziv as cNaziv, kultura.naziv kNaziv, kupci.naziv bNaziv FROM zapisi JOIN cestica_kultura ON cestica_kultura.id_cestica = zapisi.id_cestica AND cestica_kultura.id_kultura = zapisi.id_kultura JOIN cestica ON cestica.id = zapisi.id_cestica JOIN kultura ON kultura.id = zapisi.id_kultura JOIN kupci ON kupci.id = id_kupac',
}

export enum INSERTION {
  CELLS = 'INSERT INTO cestica (naziv) VALUES ($naziv)',
  CULTURES = 'INSERT INTO kultura (naziv) VALUES ($naziv)',
  BUYERS = 'INSERT INTO kupci (naziv) VALUES ($naziv)',
  CELLCULTURES = 'INSERT INTO cestica_kultura (id_cestica, id_kultura) VALUES ($id_cestica, $id_kultura)',
  ENTRY = 'INSERT INTO zapisi (id_cestica, id_kultura, id_kupac, datum, tezina) VALUES ($id_cestica, $id_kultura, $id_kupac, $datum, $tezina)',
}

export enum DELETE {
  CELLS = 'DELETE FROM cestica WHERE id = $id',
  CULTURES = 'DELETE FROM kultura WHERE id = $id',
  BUYERS = 'DELETE FROM kupci WHERE id = $id',
  CELLCULTURES = 'DELETE FROM cestica_kultura WHERE id_cestica = $id_cestica AND id_kultura = $id_kultura',
  ENTRY = 'DELETE FROM zapisi WHERE id = $id',
}

export enum ENTRYSELECT {
  CELLS = 'SELECT DISTINCT cestica.id, cestica.naziv FROM cestica_kultura JOIN cestica ON cestica.id = cestica_kultura.id_cestica',
  CULTURES = 'SELECT DISTINCT kultura.id, kultura.naziv FROM cestica_kultura JOIN kultura ON kultura.id = cestica_kultura.id_kultura',
  SELECTEDCULTURE_CELLS = 'SELECT DISTINCT cestica.id, cestica.naziv FROM cestica_kultura JOIN cestica ON cestica.id = cestica_kultura.id_cestica WHERE cestica_kultura.id_kultura = $id',
  SELECTEDCELLS_CULTURE = 'SELECT DISTINCT kultura.id, kultura.naziv FROM cestica_kultura JOIN kultura ON kultura.id = cestica_kultura.id_kultura WHERE cestica_kultura.id_cestica = $id',
}

export enum UPDATEROW {
  CELLS = 'UPDATE cestica SET naziv = $naziv WHERE id = $id',
  CULTURES = 'UPDATE kultura SET naziv = $naziv WHERE id = $id',
  CELLCULTURE = 'UPDATE cestica_kultura SET id_cestica = $id_cestica, id_kultura = $id_kultura WHERE id_cestica = $id_cestica_old AND id_kultura = $id_kultura_old',
  BUYERS = 'UPDATE kupci SET naziv = $naziv WHERE id = $id',
  ENTRY = 'UPDATE zapisi SET tezina = $tezina, id_cestica = $id_cestica, id_kultura = $id_kultura, datum = $datum, id_kupac = $id_kupac WHERE id = $id',
}

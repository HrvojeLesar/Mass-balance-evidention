/* eslint-disable no-restricted-syntax, guard-for-in */

import {
  DELETE,
  ENTRYSELECT,
  INSERTION,
  SELECTALL,
  UPDATEROW,
} from '../../../main/utilities/enums';
import { Table } from '../tableConfigInterface';
import { globalOptions } from '../utils';

export default class EntryInsertTable implements Table {
  // eslint-disable-next-line class-methods-use-this
  static async load(): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', SELECTALL.ENTRY)
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  // eslint-disable-next-line class-methods-use-this
  static async save(row: any): Promise<{ lastID: number; changes: number }> {
    const newRow = {
      $id_cestica: row.cNaziv.id,
      $id_kultura: row.kNaziv.id,
      $id_kupac: row.bNaziv.id,
      $datum: row.datum,
      $tezina: row.tezina,
    };
    const r = row;
    r.id_cestica = row.cNaziv.id;
    r.cNaziv = row.cNaziv.naziv;
    r.id_kultura = row.kNaziv.id;
    r.kNaziv = row.kNaziv.naziv;
    r.id_kupac = row.bNaziv.id;
    r.bNaziv = row.bNaziv.naziv;
    return window.api.invoke('insert-row', {
      query: INSERTION.ENTRY,
      row: newRow,
    });
  }

  static async updateDbRow(
    newValues: any,
    oldRow: any
  ): Promise<{ lastID: number; changes: number }> {
    const newRow = {
      $tezina: newValues.tezina,
      $id_cestica: newValues.cNaziv.id,
      $id_kultura: newValues.kNaziv.id,
      $datum: newValues.datum,
      $id_kupac: newValues.bNaziv.id,
      $id: oldRow.id,
    };
    return window.api.invoke('update-row', {
      query: UPDATEROW.ENTRY,
      row: newRow,
    });
  }

  static updateRow(newValues: any, oldRow: any): any {
    oldRow.bNaziv = newValues.bNaziv.naziv;
    oldRow.cNaziv = newValues.cNaziv.naziv;
    oldRow.kNaziv = newValues.kNaziv.naziv;
    oldRow.datum = newValues.datum;
    oldRow.id_cestica = newValues.cNaziv.id;
    oldRow.id_kultura = newValues.kNaziv.id;
    oldRow.id_kupac = newValues.bNaziv.id;
    oldRow.tezina = newValues.tezina;
    return oldRow;
  }

  // eslint-disable-next-line class-methods-use-this
  static async delete(row: any): Promise<{ lastID: number; changes: number }> {
    return window.api.invoke('delete-row', {
      query: DELETE.ENTRY,
      row: { $id: row.id },
    });
  }

  static async loadCells(): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', ENTRYSELECT.CELLS)
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  static async loadCultures(): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', ENTRYSELECT.CULTURES)
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  static async loadSelectedCulture_Cells(rowId: number): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', ENTRYSELECT.SELECTEDCULTURE_CELLS, {
        $id: rowId,
      })
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  static async loadSelectedCells_Culture(rowId: number): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', ENTRYSELECT.SELECTEDCELLS_CULTURE, {
        $id: rowId,
      })
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  primaryKey = 'id';

  inputs = [
    {
      title: 'Id',
      bindTo: 'id',
      insertable: false,
      searchable: false,
      type: 'text' as const,
    },
    {
      title: 'Id čestica',
      bindTo: 'id_cestica',
      insertable: false,
      searchable: false,
      type: 'text' as const,
    },
    {
      title: 'Čestica',
      bindTo: 'cNaziv',
      insertable: true,
      searchable: true,
      type: 'bindingSelect' as const,
      dataIdentifier: 'cestica',
      selectPlaceholder: 'Odabir čestice',
    },
    {
      title: 'Id kultura',
      bindTo: 'id_kultura',
      insertable: false,
      searchable: false,
      type: 'text' as const,
    },
    {
      title: 'Kultura',
      bindTo: 'kNaziv',
      insertable: true,
      searchable: true,
      type: 'bindingSelect' as const,
      dataIdentifier: 'kultura',
      selectPlaceholder: 'Odabir kulture',
    },
    {
      title: 'Id kupac',
      bindTo: 'id_kupac',
      insertable: false,
      searchable: false,
      type: 'text' as const,
    },
    {
      title: 'Kupac',
      bindTo: 'bNaziv',
      insertable: true,
      searchable: true,
      type: 'select' as const,
      dataIdentifier: 'kupac',
      selectPlaceholder: 'Odabir kupca',
    },
    {
      title: 'Težina (kg)',
      bindTo: 'tezina',
      insertable: true,
      searchable: true,
      type: 'float' as const,
    },
    {
      title: 'Datum',
      bindTo: 'datum',
      insertable: true,
      searchable: true,
      type: 'date' as const,
    },
  ];

  columns = [
    {
      formatter: 'rowSelection',
      titleFormatter: 'rowSelection',
      cellClick: (e, cell) => {
        cell.getRow().toggleSelect();
      },
      hozAlign: 'center',
      headerHozAlign: 'center',
      headerSort: false,
      widthGrow: 1,
    },
    {
      title: 'Id',
      field: 'id',
      widthGrow: 1,
      visible: false,
    },
    {
      title: 'Čestica',
      field: 'cNaziv',
      widthGrow: 3,
    },
    {
      title: 'Kultura',
      field: 'kNaziv',
      widthGrow: 3,
    },
    {
      title: 'Težina (kg)',
      field: 'tezina',
      widthGrow: 3,
    },
    {
      title: 'Kupac',
      field: 'bNaziv',
      widthGrow: 3,
    },
    {
      title: 'Datum',
      field: 'datum',
      widthGrow: 3,
      formatter: 'datetime',
      formatterParams: {
        inputFormat: 'YYYY-MM-DD',
        outputFormat: 'DD/MM/YYYY',
        invalidPlaceholder: '(invalid date)',
      },
    },
  ];

  groups = [
    {
      title: 'Čestica',
      field: 'cNaziv',
    },
    {
      title: 'Kultura',
      field: 'kNaziv',
    },
    {
      title: 'Kupac',
      field: 'bNaziv',
    },
  ];

  options = {
    ...globalOptions,
    paginationSize: 20,
    groupBy: '',
    groupStartOpen: false,
  };
}

/* eslint-disable no-restricted-syntax, guard-for-in */

import {
  DELETE,
  INSERTION,
  SELECTALL,
  UPDATEROW,
} from '../../../main/utilities/enums';
import { Table } from '../tableConfigInterface';
import { parameterizeRow, globalOptions } from '../utils';

import Cells from './cells';
import Cultures from './cultures';

export default class CellCultures implements Table {
  // eslint-disable-next-line class-methods-use-this
  static async load(): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', SELECTALL.CELLCULTURES)
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  // eslint-disable-next-line class-methods-use-this
  static async save(row: any): Promise<{ lastID: number; changes: number }> {
    const newRow = { id_cestica: row.id_cestica, id_kultura: row.id_kultura };
    const parameterizedRow = parameterizeRow(newRow);
    return window.api.invoke('insert-row', {
      query: INSERTION.CELLCULTURES,
      row: parameterizedRow,
    });
  }

  static async updateDbRow(
    newValues: any,
    oldRow: any
  ): Promise<{ lastID: number; changes: number }> {
    const newRow = {
      $id_cestica: newValues.cNaziv.id,
      $id_kultura: newValues.kNaziv.id,
      $id_cestica_old: oldRow.id_cestica,
      $id_kultura_old: oldRow.id_kultura,
    };
    return window.api.invoke('update-row', {
      query: UPDATEROW.CELLCULTURE,
      row: newRow,
    });
  }

  static updateRow(newValues: any, oldRow: any): any {
    oldRow.id_cestica = newValues.cNaziv.id;
    oldRow.id_kultura = newValues.kNaziv.id;
    oldRow.cNaziv = newValues.cNaziv.naziv;
    oldRow.kNaziv = newValues.kNaziv.naziv;
    return oldRow;
  }

  // eslint-disable-next-line class-methods-use-this
  static async delete(row: any): Promise<{ lastID: number; changes: number }> {
    const newRow = { $id_cestica: row.id_cestica, $id_kultura: row.id_kultura };
    return window.api.invoke('delete-row', {
      query: DELETE.CELLCULTURES,
      row: newRow,
    });
  }

  static customRow(row: any): any {
    return {
      cNaziv: row.cNaziv.naziv,
      id_cestica: row.cNaziv.id,
      kNaziv: row.kNaziv.naziv,
      id_kultura: row.kNaziv.id,
    };
  }

  inputs = [
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
      type: 'creatableSelect' as const,
      dataIdentifier: 'cestica',
      newSelectRow: (row: any) => {
        return Cells.save(row);
      },
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
      type: 'creatableSelect' as const,
      dataIdentifier: 'kultura',
      newSelectRow: (row: any) => {
        return Cultures.save(row);
      },
      selectPlaceholder: 'Odabir kulture',
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
      title: 'Čestica',
      field: 'cNaziv',
      widthGrow: 3,
    },
    {
      title: 'Kultura',
      field: 'kNaziv',
      widthGrow: 3,
    },
  ];

  groups = [
    {
      title: 'Čestica',
      field: 'cNaziv',
      default: true,
    },
    {
      title: 'Kultura',
      field: 'kNaziv',
    },
  ];

  options = { ...globalOptions, groupBy: 'cNaziv', groupStartOpen: false };
}

/* eslint-disable no-restricted-syntax, guard-for-in */
import {
  DELETE,
  INSERTION,
  SELECTALL,
  UPDATEROW,
} from '../../../main/utilities/enums';
import { Table } from '../tableConfigInterface';
import { parameterizeRow, globalOptions } from '../utils';

export default class Cells implements Table {
  // eslint-disable-next-line class-methods-use-this
  static async load(): Promise<any[]> {
    return window.api
      .invoke('fetch-all-table-data', SELECTALL.CELLS)
      .then((res: any) => {
        return res;
      })
      .catch((err: Error) => err);
  }

  // eslint-disable-next-line class-methods-use-this
  static async save(row: any): Promise<{ lastID: number; changes: number }> {
    const parameterizedRow = parameterizeRow(row);
    return window.api.invoke('insert-row', {
      query: INSERTION.CELLS,
      row: parameterizedRow,
    });
  }

  static async updateDbRow(
    newValues: any,
    oldRow: any
  ): Promise<{ lastID: number; changes: number }> {
    const newRow = {
      $id: oldRow.id,
      $naziv: newValues.naziv,
    };
    return window.api.invoke('update-row', {
      query: UPDATEROW.CELLS,
      row: newRow,
    });
  }

  static updateRow(newValues: any, oldRow: any): any {
    oldRow.naziv = newValues.naziv;
    return oldRow;
  }

  // eslint-disable-next-line class-methods-use-this
  static async delete(row: any): Promise<{ lastID: number; changes: number }> {
    return window.api.invoke('delete-row', {
      query: DELETE.CELLS,
      row: { $id: row.id },
    });
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
      title: 'Čestica',
      bindTo: 'naziv',
      insertable: true,
      searchable: true,
      type: 'text' as const,
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
      field: 'naziv',
      widthGrow: 3,
    },
  ];

  options = globalOptions;
}

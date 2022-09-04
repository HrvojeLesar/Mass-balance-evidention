import { RunResult, Statement } from 'sqlite3';
import DB_MANAGER from './databaseManager';
import { SELECTALL, INSERTION, DELETE, UPDATEROW } from './enums';

export function selectAll(query: SELECTALL, args: any = []) {
  return new Promise((resolve, reject) => {
    DB_MANAGER.CURRENT_DB.all(
      query,
      args,
      function selectResult(this: Statement, err: Error, rows: any) {
        if (err) {
          reject(err);
        }
        resolve(rows);
      }
    );
  });
}

export function insertRow(query: INSERTION, data: any) {
  return new Promise((resolve, reject) => {
    DB_MANAGER.CURRENT_DB.run(
      query,
      data,
      function insertResult(this: RunResult, err: Error) {
        if (err) {
          reject(err);
        }
        if (this.changes >= 1) {
          resolve(this);
        } else {
          reject(new Error('No changes made'));
        }
      }
    );
  });
}

export function updateRow(query: UPDATEROW, data: any) {
  return new Promise((resolve, reject) => {
    DB_MANAGER.CURRENT_DB.run(
      query,
      data,
      function updateResult(this: RunResult, err: Error) {
        if (err) {
          reject(err);
        }
        if (this.changes >= 1) {
          resolve(this);
        } else {
          reject(new Error('No changes made'));
        }
      }
    );
  });
}

export function deleteRow(query: DELETE, data: any) {
  return new Promise((resolve, reject) => {
    DB_MANAGER.CURRENT_DB.run(
      query,
      data,
      function deleteResult(this: RunResult, err: Error) {
        if (err) {
          reject(err);
        }
        if (this.changes >= 1) {
          resolve(this);
        } else {
          reject(new Error('No changes made'));
        }
      }
    );
  });
}

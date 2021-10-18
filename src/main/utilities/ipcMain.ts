import { ipcMain } from 'electron';
import Config, { DatabaseConfigInfo } from './config';

import { selectAll, insertRow, deleteRow, updateRow } from './database';
import DatabaseManager from './databaseManager';
import { SELECTALL, INSERTION, DELETE, UPDATEROW } from './enums';

ipcMain.handle(
  'fetch-all-table-data',
  async (_, query: SELECTALL, args: any = []) => {
    return selectAll(query, args);
  }
);

ipcMain.handle(
  'insert-row',
  async (_, data: { query: INSERTION; row: any }) => {
    return insertRow(data.query, data.row);
  }
);

ipcMain.handle('delete-row', async (_, data: { query: DELETE; row: any }) => {
  return deleteRow(data.query, data.row);
});

ipcMain.handle(
  'update-row',
  async (_, data: { query: UPDATEROW; row: any }) => {
    return updateRow(data.query, data.row);
  }
);

ipcMain.handle('get-databases', async () => {
  return Config.CURRENT_CONFIG;
});

ipcMain.handle('rename-database', async (_, data) => {
  return Config.renameDatabase(data.alias, data.path);
});

ipcMain.handle('set-database', async (_, database: DatabaseConfigInfo) => {
  return DatabaseManager.setCurrentDatabase(database);
});

ipcMain.handle('new-database', async (_, database: DatabaseConfigInfo) => {
  return DatabaseManager.newDatabase(database);
});

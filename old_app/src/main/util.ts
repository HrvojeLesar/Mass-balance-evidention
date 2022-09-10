/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import Config from './utilities/config';
import DatabaseManager from './utilities/databaseManager';

export let resolveHtmlPath: (htmlFileName: string) => string;
export let startupProtocol: () => void;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

startupProtocol = () => {
  Config.createDirectory();
  Config.createConfig();
  Config.readConfig();
  Config.migrateToVersionOne();
  DatabaseManager.dbCheck();
  DatabaseManager.connectToDatabase();
};

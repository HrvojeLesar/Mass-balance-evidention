/* eslint-disable no-underscore-dangle */

import path from 'path';
import fs from 'fs';
import { Database } from 'sqlite3';
import Config, { DatabaseConfigInfo } from './config';
import migrations from './runMigrations';

export default class DatabaseManager {
  private static _CURRENT_DB: Database;

  private static _nameIndexingRegex = /\([0-9]+\)/g;

  public static get CURRENT_DB_PATH() {
    return path.resolve(
      Config.HOMEDIR,
      Config.DB_DIR_NAME,
      Config.CURRENT_CONFIG.currentDb.path.concat('.db')
    );
  }

  public static get CURRENT_DB() {
    return DatabaseManager._CURRENT_DB;
  }

  public static newDatabase(db: DatabaseConfigInfo, add = true) {
    DatabaseManager.createPathIfUnavailable(db);
    migrations.newDatabase(path.resolve(Config.PATH, db.path.concat('.db')));
    if (add) {
      Config.addDb(db);
    }
    return db;
  }

  public static setCurrentDatabase(setTo: DatabaseConfigInfo): boolean {
    let selectedDatabase: DatabaseConfigInfo | null = null;
    Config.CURRENT_CONFIG.databases.every((db) => {
      if (db.path === setTo.path) {
        selectedDatabase = db;
        return false;
      }
      return true;
    });

    if (selectedDatabase) {
      // if (DatabaseManager._CURRENT_DB !== undefined) {
      //   DatabaseManager.closeDatabaseConnection();
      // }
      Config.setCurrentDb(selectedDatabase);
      DatabaseManager.connectToDatabase();
      return true;
    }
    return false;
  }

  public static dbCheck(add = true) {
    if (!fs.existsSync(Config.CURRENT_DB_FULL_PATH)) {
      DatabaseManager.newDatabase(Config.CURRENT_CONFIG.currentDb, add);
      // DatabaseManager.newDatabase(Config.CURRENT_CONFIG.currentDb.path);
      console.log('Database created!');
    }
  }

  // public static setCurrentDatabase(dbPath: string) {
  //   let found = false;
  //   const dbNameExtention = `${dbPath} + '.db'`;
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const db of Config.CURRENT_CONFIG.databases) {
  //     if (db.path === dbNameExtention) {
  //       found = true;
  //       break;
  //     }
  //   }

  //   if (!found) {
  //     /* TU SE NEKAJ DOGADA */ return;
  //   }

  //   if (DatabaseManager._CURRENT_DB !== undefined) {
  //     DatabaseManager.closeDatabaseConnection();
  //   }

  //   Config.setCurrentDb(dbPath);
  //   DatabaseManager.connectToDatabase();
  // }

  // static connectToDatabase() {
  //   DatabaseManager._CURRENT_DB = new Database(
  //     DatabaseManager.CURRENT_DB_PATH,
  //     (err: any) => {
  //       if (err) {
  //         console.log('Error connecting to database!');
  //         console.log(err);
  //       }
  //     }
  //   ); // TODO: err neje handlani
  //   DatabaseManager.CURRENT_DB.run('PRAGMA foreign_keys = ON');
  // }

  // static closeDatabaseConnection() {
  //   DatabaseManager._CURRENT_DB.close();
  // }

  static connectToDatabase() {
    if (DatabaseManager._CURRENT_DB !== undefined) {
      DatabaseManager._CURRENT_DB.close((err: any) => {
        if (err) {
          console.log(err);
        } else {
          DatabaseManager.dbCheck(false);
          DatabaseManager.establishConnection();
        }
      });
    } else {
      DatabaseManager.dbCheck(false);
      DatabaseManager.establishConnection();
    }
  }

  static establishConnection() {
    DatabaseManager._CURRENT_DB = new Database(
      DatabaseManager.CURRENT_DB_PATH,
      (err: any) => {
        if (err) {
          console.log('Error connecting to database!');
          console.log(err);
        }
      }
    ); // TODO: err neje handlani
    DatabaseManager.CURRENT_DB.run('PRAGMA foreign_keys = ON');
  }

  // static closeDatabaseConnection() {
  //   DatabaseManager._CURRENT_DB.close();
  // }

  static createPathIfUnavailable(db: DatabaseConfigInfo) {
    while (fs.existsSync(path.resolve(Config.PATH, db.path.concat('.db')))) {
      const match = DatabaseManager.isNumbered(db);
      if (match) {
        const lastMatch = match[match.length - 1];
        const pathWithoutNumber = db.path.replace(lastMatch, '');
        const newNumber = DatabaseManager.extractNumberFromMatch(lastMatch);
        db.path = pathWithoutNumber.concat(`(${newNumber + 1})`);
      } else {
        db.path = db.path.concat(' (2)');
      }
    }
  }

  static isNumbered(db: DatabaseConfigInfo) {
    const matches = db.path.match(DatabaseManager._nameIndexingRegex);
    if (matches) {
      return matches;
    }
    return null;
  }

  static extractNumberFromMatch(match: string) {
    let num = match.replace('(', '');
    num = num.replace(')', '');
    return Number(num);
  }
}

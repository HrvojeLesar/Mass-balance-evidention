/* eslint-disable no-underscore-dangle */
import path from 'path';
import os from 'os';
import fs from 'fs';
// eslint-disable-next-line import/no-cycle
// import DatabaseManager from './databaseManager';

export type DatabaseConfigInfo = {
  alias: string;
  path: string;
};

export type ConfigJSONOld = {
  startup: string;
  databases: DatabaseConfigInfo[];
};

export type ConfigJSON = {
  // initial version startup field
  startup?: string;

  version: number;
  currentDb: DatabaseConfigInfo;
  databases: DatabaseConfigInfo[];
};

export default class Config {
  public static HOMEDIR = os.homedir();

  public static DB_DIR_NAME = '.mass-balance-evidention';

  public static CONFIG_NAME = 'config.json';

  public static DEFAULT_DB_PATH = 'baza';

  public static DEFAULT_DB_ALIAS = 'Main';

  public static PATH = path.resolve(Config.HOMEDIR, Config.DB_DIR_NAME);

  public static CONFIGPATH = path.resolve(Config.PATH, Config.CONFIG_NAME);

  public static DEFAULT_DB_FULL_PATH = path.resolve(
    Config.PATH,
    Config.DEFAULT_DB_PATH
  );

  public static get CURRENT_DB_FULL_PATH() {
    return path.resolve(
      Config.PATH,
      Config.CURRENT_CONFIG.currentDb.path.concat('.db')
    );
  }

  public static get CURRENT_CONFIG() {
    return Config._CURRENT_CONFIG;
  }

  public static get DEFAULT_CONFIG(): ConfigJSON {
    return {
      version: 1.0,
      currentDb: {
        alias: Config.DEFAULT_DB_ALIAS,
        path: Config.DEFAULT_DB_PATH,
      },
      databases: [
        {
          alias: Config.DEFAULT_DB_ALIAS,
          path: Config.DEFAULT_DB_PATH,
        },
      ],
    };
  }

  private static _CURRENT_CONFIG = Config.DEFAULT_CONFIG;

  public static setCurrentDb(selectedDb: DatabaseConfigInfo) {
    Config._CURRENT_CONFIG.currentDb = selectedDb;
    Config._saveConfig(Config._CURRENT_CONFIG);
  }

  public static addDb(db: DatabaseConfigInfo) {
    Config._CURRENT_CONFIG.databases.push(db);
    Config._saveConfig(this._CURRENT_CONFIG);
  }

  // public static dbCheck() {
  //   if (!fs.existsSync(Config.DEFAULT_DB_PATH)) {
  //     DatabaseManager.newDatabase(Config.DEFAULT_DB_NAME);
  //     console.log('Database created!');
  //   }
  // }

  public static createConfig() {
    if (!fs.existsSync(Config.CONFIGPATH)) {
      fs.writeFileSync(
        Config.CONFIGPATH,
        JSON.stringify(Config.DEFAULT_CONFIG)
      );
      return true;
    }
    return false;
  }

  public static readConfig() {
    try {
      Config._CURRENT_CONFIG = JSON.parse(
        fs.readFileSync(Config.CONFIGPATH).toString()
      );
    } catch (err) {
      console.log(err);
      console.log('Falling back to default config!');
      console.log('Writing default config to disk!');
      Config._saveConfig(Config.DEFAULT_CONFIG);
      Config._CURRENT_CONFIG = Config.DEFAULT_CONFIG;
    }
  }

  private static _saveConfig(data: ConfigJSON) {
    fs.writeFileSync(Config.CONFIGPATH, JSON.stringify(data));
  }

  public static createDirectory(dir: string = Config.DB_DIR_NAME) {
    if (!fs.existsSync(path.resolve(Config.HOMEDIR, dir))) {
      fs.mkdirSync(path.resolve(Config.HOMEDIR, dir), { recursive: true });
      return true;
    }
    return false;
  }

  public static renameDatabase(newName: string, dbPath: string) {
    const currentConfig = Config._CURRENT_CONFIG;
    if (currentConfig.currentDb.path === dbPath) {
      currentConfig.currentDb.alias = newName;
    }
    currentConfig.databases.every((db) => {
      if (db.path === dbPath) {
        db.alias = newName;
        return false;
      }
      return true;
    });
    Config._saveConfig(currentConfig);
  }

  public static migrateToVersionOne() {
    const currentConfig = Config._CURRENT_CONFIG;
    if (currentConfig.startup) {
      const currentDbPath = currentConfig.startup;
      const currentDbAlias = currentConfig.databases.find(
        (element) => element.path === currentDbPath
      )?.alias;
      if (currentDbAlias) {
        currentConfig.currentDb = {
          alias: currentDbAlias,
          path: currentDbPath.slice(0, currentDbPath.length - 3),
        };
      } else {
        currentConfig.currentDb = {
          alias: Config.DEFAULT_DB_ALIAS,
          path: Config.DEFAULT_DB_PATH,
        };
      }
      delete currentConfig.startup;

      currentConfig.databases.forEach((database) => {
        database.path = database.path.slice(0, database.path.length - 3);
      });

      currentConfig.version = 1.0;
      Config._saveConfig(currentConfig);
    }
  }

  // public static startupProtocol() {
  //   Config.createDirectory();
  //   Config.createConfig();
  //   Config.readConfig();
  //   Config.dbCheck();
  //   DatabaseManager.connectToDatabase();
  // }
}

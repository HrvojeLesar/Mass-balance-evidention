import { Database } from 'sqlite3';

const MIGRATIONS_UP = `
PRAGMA foreign_keys = ON;

CREATE TABLE cestica (
    id INTEGER PRIMARY KEY,
    naziv VARCHAR(30) UNIQUE
);

CREATE TABLE kultura (
    id INTEGER PRIMARY KEY,
    naziv VARCHAR(255) UNIQUE
);

CREATE TABLE cestica_kultura (
    id_cestica INT REFERENCES cestica(id),
    id_kultura INT REFERENCES kultura(id),
    PRIMARY KEY (id_cestica, id_kultura)
);

CREATE TABLE zapisi (
    id INTEGER PRIMARY KEY,
    tezina FLOAT8,
    id_cestica INT,
    id_kultura INT,
    datum date,
    id_kupac INT REFERENCES kupci(id),
    FOREIGN KEY(id_cestica, id_kultura) REFERENCES cestica_kultura(id_cestica, id_kultura)
);

CREATE TABLE kupci (
    id INTEGER PRIMARY KEY,
    naziv VARCHAR(255) UNIQUE
);
`;

const MIGRATIONS_DOWN = `
DROP TABLE zapisi;
DROP TABLE kultura;
DROP TABLE cestica;
DROP TABLE cestica_kultura;
DROP TABLE kupci;
`;

function runMigrations(db: Database) {
  db.exec(MIGRATIONS_UP);
}

function newDatabase(path: string) {
  const db: Database = new Database(path);
  runMigrations(db);
  db.close();
}

export default {
  newDatabase,
};

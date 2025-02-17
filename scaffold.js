import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync('./database.db');

database.exec(`
    CREATE TABLE income_item (
        key INTEGER PRIMARY KEY,
        name TEXT,
        amount REAL,
        month INTEGER
    );
    
    CREATE TABLE spend_item (
        key INTEGER PRIMARY KEY,
        name TEXT,
        amount REAL,
        month INTEGER,
        category TEXT,
        is_tracked INTEGER
    );

    CREATE TABLE expense (
        key INTEGER PRIMARY KEY,
        name TEXT,
        amount REAL,
        month INTEGER,
        date TEXT,
        spend_item INTEGER,
        FOREIGN KEY(spend_item) REFERENCES spend_item(key)
    );
`);

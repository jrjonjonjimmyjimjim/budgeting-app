import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync('./database.db');

database.exec(`
    ALTER TABLE spend_item
    ADD notes TEXT;
`);

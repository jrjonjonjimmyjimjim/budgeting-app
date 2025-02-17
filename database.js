import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync('./database.db');

export default database;
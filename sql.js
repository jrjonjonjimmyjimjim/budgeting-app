import postgres from 'postgres';
import fs from 'node:fs';

let sql;
try {
  const data = fs.readFileSync('./config.json', 'utf8');
  const { postgresOptions } = JSON.parse(data);
  sql = postgres(postgresOptions);
} catch (err) {
  console.error(err);
  console.log('Make sure `config.json` exists and is modeled after `config-example.json`');
}

export default sql;
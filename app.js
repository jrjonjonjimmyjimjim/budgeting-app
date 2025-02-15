import express from 'express';
import postgres from 'postgres';
import createRootTemplate from './views/root.js';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.get('/', async (req, res) => {
    const sql = postgres({ user: 'postgres', password: 'i5;RPgHk:6>}fXgQmqZG' });

    const expenses = await sql`
    select
      date,
      amount
    from expense
  `;

  console.info(expenses);
    res.send(createRootTemplate());
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
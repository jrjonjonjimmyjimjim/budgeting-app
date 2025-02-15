import express from 'express';
import sql from './sql.js';
import createRootTemplate from './views/root.js';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.get('/', async (req, res) => {
    res.send(await createRootTemplate({ month: 202502 }));
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
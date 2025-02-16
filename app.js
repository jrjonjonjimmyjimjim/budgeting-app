import express from 'express';
import sql from './sql.js';
import createRootTemplate from './views/root.js';
import createSummaryTemplate from './views/summary.js';
import createIncomeItemTemplate from './views/incomeItem.js';
import createIncomeTableTemplate from './views/incomeTable.js';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.get('/', async (req, res) => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;

    let monthString;
    if (month < 10) {
        monthString = `0${month}`;
    } else {
        monthString = `${month}`;
    }
    monthString = `${currentDate.getFullYear()}${monthString}`;
    res.send(await createRootTemplate({ month: monthString }));
});

app.get('/:month/summary', async (req, res) => {
    const { month } = req.params;

    res.send(await createSummaryTemplate({ month }));
});

app.get('/:month/income/:name', async (req, res) => {
    const { month, name } = req.params;

    if (name === 'new') {
        res.send()
        return;
    }

    res.send(await createIncomeItemTemplate({ month, name }));
});

app.put('/:month/income/:name', async (req, res) => {
    const { month, name } = req.params;
    const { item_name, item_amount } = req.body;

    // TODO: Find existing expenses that were pointing to this income item and update them
    await sql`
        UPDATE income_item
        SET name = ${item_name}, amount = ${item_amount}
        WHERE month = ${month} AND name = ${name}
    `;
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(await createIncomeTableTemplate({ month }));
});

app.delete('/:month/income/:name', async (req, res) => {
    const { month, name } = req.params;

    // TODO: Find existing expenses that were pointing to this income item and... reassign them?
    await sql`
        DELETE FROM income_item
        WHERE month = ${month} AND name = ${name}
    `;
    
    res.send(await createIncomeTableTemplate({ month }));
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
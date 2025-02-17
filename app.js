import express from 'express';
import database from './database.js';
import createRootTemplate from './views/root.js';
import createSummaryTemplate from './views/summary.js';
import createNewIncomeItemTemplate from './views/newIncomeItem.js';
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

app.get('/summary/:month', async (req, res) => {
    const { month } = req.params;
    res.send(await createSummaryTemplate({ month }));
});

app.get('/income/new_item/:month', async (req, res) => {
    const { month } = req.params;
    res.send(createNewIncomeItemTemplate({ month }));
});

app.get('/income/:incomeItem', async (req, res) => {
    const { incomeItem } = req.params;
    res.send(await createIncomeItemTemplate({ incomeItem }));
});

app.get('/spend/new_item/:month/:category', async (req, res) => {
    const { month, category } = req.params;
    res.send(createNewSpendItemTemplate({ month, category }));
});

app.get('/spend/:spend_item', async (req, res) => {
    const { spend_item } = req.params;
    res.send(await createSpendItemTemplate({ spend_item }));
});

app.post('/income/new_item/:month', async (req, res) => {
    const { month } = req.params;
    const { item_name, item_amount } = req.body;

    const income_itemInsert = database.prepare(`
        INSERT INTO income_item (name, amount, month)
        VALUES (?, ?, ?)
    `);
    income_itemInsert.run(item_name, item_amount, month);

    res.set('HX-Trigger', 'recalc-totals');
    res.send(await createIncomeTableTemplate({ month }));
});

app.put('/income/:incomeItem', async (req, res) => {
    const { incomeItem } = req.params;
    const { item_name, item_amount } = req.body;

    const income_itemQuery = database.prepare(`
        SELECT
            month
        FROM
            income_item
        WHERE
            key = ?
    `);
    const income_item = income_itemQuery.get(incomeItem);
    // TODO: Find existing expenses that were pointing to this income item and update them
    const income_itemUpdate = database.prepare(`
        UPDATE income_item
        SET name = ?, amount = ?
        WHERE key = ?
    `);
    income_itemUpdate.run(item_name, item_amount, incomeItem);
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(await createIncomeTableTemplate({ month: income_item.month }));
});

app.delete('/income/:incomeItem', async (req, res) => {
    const { incomeItem } = req.params;

    const income_itemQuery = database.prepare(`
        SELECT
            month
        FROM
            income_item
        WHERE
            key = ?
    `);
    const income_item = income_itemQuery(incomeItem)
    // TODO: Find existing expenses that were pointing to this income item and... reassign them?
    const income_itemDelete = database.prepare(`
        DELETE FROM income_item
        WHERE key = ?
    `);
    income_itemDelete.run(incomeItem);
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(await createIncomeTableTemplate({ month: income_item.month }));
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
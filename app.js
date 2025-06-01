import _ from 'lodash';
import express from 'express';
import basicAuth from 'express-basic-auth';
import users from './users.json' with { type: 'json' };
import database from './database.js';
import createRootTemplate from './views/root.js';
import createSummaryTemplate from './views/summary.js';
import createNewIncomeItemTemplate from './views/newIncomeItem.js';
import createIncomeItemTemplate from './views/incomeItem.js';
import createIncomeTableTemplate from './views/incomeTable.js';
import createNewSpendTableTemplate from './views/newSpendTable.js';
import createSpendTableTemplate from './views/spendTable.js';
import createSpendItemTemplate from './views/spendItem.js';
import createNewSpendItemTemplate from './views/newSpendItem.js';
import createExpenseTableTemplate from './views/expenseTable.js';
import createNewExpenseItemTemplate from './views/newExpenseItem.js';
import createExpenseItemTemplate from './views/expenseItem.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import config from './config.json' with { type: 'json' };

const HTTP_PORT = 80;
const HTTP_DEVELOPMENT_PORT = 8080;
const HTTPS_PORT = 443;

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.use(
    basicAuth({
        users,
        challenge: true,
        unauthorizedResponse: 'Oopsies. Log in.',
    })
);

app.get('/', (req, res) => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;

    let monthString;
    if (month < 10) {
        monthString = `0${month}`;
    } else {
        monthString = `${month}`;
    }
    monthString = `${currentDate.getFullYear()}${monthString}`;
    res.send(createRootTemplate({ month: monthString }));
});

app.get('/month/:month', (req, res) => {
    const { month } = req.params;

    res.send(createRootTemplate({ month }));
});

app.get('/summary/:month', (req, res) => {
    const { month } = req.params;
    res.send(createSummaryTemplate({ month }));
});

app.get('/income/new_item/:month', (req, res) => {
    const { month } = req.params;
    res.send(createNewIncomeItemTemplate({ month }));
});

app.get('/income/:incomeItem', (req, res) => {
    const { incomeItem } = req.params;
    res.send(createIncomeItemTemplate({ incomeItem }));
});

app.get('/new_spend_table/:month', (req, res) => {
    const { month } = req.params;
    res.send(createNewSpendTableTemplate({ month }));
});

app.get('/spend/new_item/:month/:category', (req, res) => {
    const { month, category } = req.params;
    res.send(createNewSpendItemTemplate({ month, category }));
});

app.get('/spend/:spendItem', (req, res) => {
    const { spendItem } = req.params;
    res.send(createSpendItemTemplate({ spendItem }));
});

app.get('/spend/:spendItem/expense', (req, res) => {
    const { spendItem } = req.params;
    res.send(createExpenseTableTemplate({ spendItem }));
});

app.get('/expense/new_item/:spendItem', (req, res) => {
    const { spendItem } = req.params;
    res.send(createNewExpenseItemTemplate({ spendItem }));
});

app.get('/expense/:expenseItem', (req, res) => {
    const { expenseItem } = req.params;
    res.send(createExpenseItemTemplate({ expenseItem }));
});

app.get('/copy/:previousMonth/:month/', (req, res) => {
    const { previousMonth, month } = req.params;

    const prevMonthIncomeItemsQuery = database.prepare(`
        SELECT
            name,
            amount
        FROM
            income_item
        WHERE
            month = ?
        ORDER BY name
    `);
    const prevMonthIncomeItems = prevMonthIncomeItemsQuery.all(previousMonth);
    _.forEach(prevMonthIncomeItems, (prevMonthIncomeItem) => {
        const income_itemInsert = database.prepare(`
            INSERT INTO income_item (name, amount, month)
            VALUES (?, ?, ?)
        `);
        income_itemInsert.run(prevMonthIncomeItem.name, prevMonthIncomeItem.amount, month);
    });
    const prevMonthSpendItemsQuery = database.prepare(`
        SELECT
            name,
            amount,
            category,
            is_tracked,
            notes
        FROM
            spend_item
        WHERE
            month = ?
        ORDER BY name
    `);
    const prevMonthSpendItems = prevMonthSpendItemsQuery.all(previousMonth);
    _.forEach(prevMonthSpendItems, (prevMonthSpendItem) => {
        const spend_itemInsert = database.prepare(`
            INSERT INTO spend_item (name, amount, month, category, is_tracked, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        spend_itemInsert.run(
            prevMonthSpendItem.name,
            prevMonthSpendItem.amount,
            month,
            prevMonthSpendItem.category,
            prevMonthSpendItem.is_tracked,
            prevMonthSpendItem.notes
        );
    });

    res.redirect(`/month/${month}`);
});

app.post('/income/new_item/:month', (req, res) => {
    const { month } = req.params;
    const { item_name, item_amount } = req.body;

    if (!isNaN(item_amount)) {
        const income_itemInsert = database.prepare(`
            INSERT INTO income_item (name, amount, month)
            VALUES (?, ?, ?)
        `);
        income_itemInsert.run(item_name, item_amount, month);
    }

    res.set('HX-Trigger', 'recalc-totals');
    res.send(createIncomeTableTemplate({ month }));
});

app.post('/spend/new_item/:month/:category/', (req, res) => {
    const { month, category } = req.params;
    const { item_name, item_amount } = req.body;

    if (!isNaN(item_amount)) {
        const spend_itemInsert = database.prepare(`
            INSERT INTO spend_item (name, amount, month, category, is_tracked)
            VALUES (?, ?, ?, ?, ?)
        `);
        spend_itemInsert.run(item_name, item_amount, month, category, 1);
    }

    res.set('HX-Trigger', 'recalc-totals');
    res.send(createSpendTableTemplate({ month, category }));
});

app.post('/new_spend_table/:month', (req, res) => {
    const { month } = req.params;
    const { category_name } = req.body;

    const spend_itemInsert = database.prepare(`
        INSERT INTO spend_item (name, amount, month, category, is_tracked)
        VALUES (?, ?, ?, ?, ?)
    `);
    spend_itemInsert.run('New Item', 0, month, category_name, 1);

    res.send(createSpendTableTemplate({ month, category: category_name }));
});

app.post('/expense/new_item/:spendItem/', (req, res) => {
    const { spendItem } = req.params;
    const { item_name, item_amount, item_date } = req.body;

    const spendItemQuery = database.prepare(`
        SELECT
            spend_item.month month,
            spend_item.category category
        FROM
            spend_item
        WHERE
            spend_item.key = ?
    `);
    const spendItemDetails = spendItemQuery.get(spendItem);

    if (!isNaN(item_amount)) {
        const expenseInsert = database.prepare(`
            INSERT INTO expense (name, amount, date, spend_item)
            VALUES (?, ?, ?, ?)
        `);
        expenseInsert.run(item_name, item_amount, item_date, spendItem);
    }

    res.send(`
        ${createExpenseTableTemplate({ spendItem })}
        ${createSpendTableTemplate({ month: spendItemDetails.month, category: spendItemDetails.category, outOfBand: true })}
    `);
});

app.put('/income/:incomeItem', (req, res) => {
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

    if (!isNaN(item_amount)) {
        const income_itemUpdate = database.prepare(`
            UPDATE income_item
            SET name = ?, amount = ?
            WHERE key = ?
        `);
        income_itemUpdate.run(item_name, item_amount, incomeItem);
    }
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(createIncomeTableTemplate({ month: income_item.month }));
});

app.put('/spend/:spendItem', (req, res) => {
    const { spendItem } = req.params;
    const { item_name, item_amount } = req.body;

    const spend_itemQuery = database.prepare(`
        SELECT
            month,
            category
        FROM
            spend_item
        WHERE
            key = ?
    `);
    const spend_item = spend_itemQuery.get(spendItem);

    if (!isNaN(item_amount)) {
        const spend_itemUpdate = database.prepare(`
            UPDATE spend_item
            SET name = ?, amount = ?
            WHERE key = ?
        `);
        spend_itemUpdate.run(item_name, item_amount, spendItem);
    }
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(createSpendTableTemplate({ month: spend_item.month, category: spend_item.category }));
});

app.put('/spend/:spendItem/tracked', (req, res) => {
    const { spendItem } = req.params;
    const { is_tracked } = req.body;

    const spend_itemQuery = database.prepare(`
        SELECT
            month,
            category
        FROM
            spend_item
        WHERE
            key = ?
    `);
    const spend_item = spend_itemQuery.get(spendItem);

    const spend_itemUpdate = database.prepare(`
        UPDATE spend_item
        SET is_tracked = ?
        WHERE key = ?
    `);
    spend_itemUpdate.run(is_tracked === 'on' ? 1 : 0, spendItem);
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(createSpendTableTemplate({ month: spend_item.month, category: spend_item.category }));
});

app.put('/spend/:spendItem/notes', (req, res) => {
    const { spendItem } = req.params;
    const { notes } = req.body;

    const spend_itemQuery = database.prepare(`
        SELECT
            month,
            category
        FROM
            spend_item
        WHERE
            key = ?
    `);
    const spend_item = spend_itemQuery.get(spendItem);

    const spend_itemUpdate = database.prepare(`
        UPDATE spend_item
        SET notes = ?
        WHERE key = ?
    `);
    spend_itemUpdate.run(notes, spendItem);
    
    res.send('OK');
});

app.put('/expense/:expenseItem', (req, res) => {
    const { expenseItem } = req.params;
    const { item_name, item_amount, item_date } = req.body;

    const expenseQuery = database.prepare(`
        SELECT
            spend_item.key spend_item,
            spend_item.month month,
            spend_item.category category
        FROM
            expense
            INNER JOIN spend_item ON (expense.spend_item = spend_item.key)
        WHERE
            expense.key = ?
    `);
    const expense = expenseQuery.get(expenseItem);

    if (!isNaN(item_amount)) {
        const expenseUpdate = database.prepare(`
            UPDATE expense
            SET name = ?, amount = ?, date = ?
            WHERE key = ?
        `);
        expenseUpdate.run(item_name, item_amount, item_date, expenseItem);
    }
    
    res.send(`
        ${createExpenseTableTemplate({ spendItem: expense.spend_item })}
        ${createSpendTableTemplate({ month: expense.month, category: expense.category, outOfBand: true })}
    `);
});

app.delete('/income/:incomeItem', (req, res) => {
    const { incomeItem } = req.params;

    const income_itemQuery = database.prepare(`
        SELECT
            month
        FROM
            income_item
        WHERE
            key = ?
    `);
    const income_item = income_itemQuery.get(incomeItem)

    const income_itemDelete = database.prepare(`
        DELETE FROM income_item
        WHERE key = ?
    `);
    income_itemDelete.run(incomeItem);
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(createIncomeTableTemplate({ month: income_item.month }));
});

app.delete('/spend/:spendItem', (req, res) => {
    const { spendItem } = req.params;

    const spend_itemQuery = database.prepare(`
        SELECT
            month,
            category
        FROM
            spend_item
        WHERE
            key = ?
    `);
    const spend_item = spend_itemQuery.get(spendItem)
    // TODO: Find existing expenses that were pointing to this spend item and... reassign them?
    const spend_itemDelete = database.prepare(`
        DELETE FROM spend_item
        WHERE key = ?
    `);
    spend_itemDelete.run(spendItem);
    
    res.set('HX-Trigger', 'recalc-totals');
    res.send(createSpendTableTemplate({ month: spend_item.month, category: spend_item.category }));
});

app.delete('/expense/:expenseItem', (req, res) => {
    const { expenseItem } = req.params;

    const expenseQuery = database.prepare(`
        SELECT
            spend_item.key spend_item,
            spend_item.month month,
            spend_item.category category
        FROM
            expense
            INNER JOIN spend_item ON (expense.spend_item = spend_item.key)
        WHERE
            expense.key = ?
    `);
    const expense = expenseQuery.get(expenseItem);

    const expenseDelete = database.prepare(`
        DELETE FROM expense
        WHERE key = ?
    `);
    expenseDelete.run(expenseItem);
    
    res.send(`
        ${createExpenseTableTemplate({ spendItem: expense.spend_item })}
        ${createSpendTableTemplate({ month: expense.month, category: expense.category, outOfBand: true })}
    `);
});

if (config.httpsOptions.key && config.httpsOptions.cert) {
    const httpsServer = https.createServer({
        key: fs.readFileSync(config.httpsOptions.key),
        cert: fs.readFileSync(config.httpsOptions.cert),
    }, app);
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`HTTPS server listening on port ${HTTPS_PORT}`);
    });
} else {
    const httpServer = http.createServer(app);
    if (config.development) {
        httpServer.listen(HTTP_DEVELOPMENT_PORT, () => {
            console.log(`HTTP Server running on port ${HTTP_DEVELOPMENT_PORT}`);
        });
    } else {
        httpServer.listen(HTTP_PORT, () => {
            console.log(`HTTP Server running on port ${HTTP_PORT}`);
        });
    }
}
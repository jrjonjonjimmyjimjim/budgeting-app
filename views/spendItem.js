import _ from 'lodash';
import database from '../database.js';

// TODO: You were working on this before pivoting to sql stuff
async function createSpendItemTemplate({ spendItem }) {
    const itemQuery = database.prepare(`
        SELECT
            name,
            amount,
            is_tracked
        FROM
            spend_item
        WHERE
            key = ?
        ORDER BY name
    `);
    const item = itemQuery.all(spendItem);
    const expensesQuery = database.prepare(`
        SELECT
            name,
            amount,
            date,
            spend_item
        FROM
            expense
        WHERE
            spend_item = ?
        ORDER BY name
    `);
    const expenses = expensesQuery.all(spendItem);

    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" value="${item.name}"></input></td>
        <td><input id="item-amount" name="item_amount" type="text" value="${item.amount}"></input></td>
        <td>${item.spent}</td>
        <td>${item.remain}</td>
        <td>
            <span hx-put="/${month}/spend/${category}/${name}/" hx-target="closest div" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
            | <span hx-delete="/${month}/spend/${category}/${name}/" hx-target="closest div" hx-swap="outerHTML">Delete</span>
        </td>
    </tr>
    `
}

export default createSpendItemTemplate;
import _ from 'lodash';
import database from '../database.js';

function createSpendItemTemplate({ spendItem }) {
    const itemQuery = database.prepare(`
        SELECT
            name,
            amount,
            is_tracked,
            category
        FROM
            spend_item
        WHERE
            key = ?
        ORDER BY name
    `);
    const item = itemQuery.get(spendItem);
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
        ORDER BY date
    `);
    const expenses = expensesQuery.all(spendItem);

    const totalExpensesForSpendItem = spendItem.is_tracked ? _.sumBy(expenses, 'amount') : spendItem.amount;

    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" size="10" value="${item.name}"></input></td>
        <td><input id="item-amount" name="item_amount" type="text" size="8" value="${item.amount.toFixed(2)}"></input></td>
        <td>${totalExpensesForSpendItem.toFixed(2)}</td>
        <td>${(item.amount - totalExpensesForSpendItem).toFixed(2)}</td>
        <td>
            <span hx-put="/spend/${spendItem}/" hx-target="#spend-${item.category}" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
            | <span hx-delete="/spend/${spendItem}/" hx-target="#spend-${item.category}" hx-swap="outerHTML">Delete</span>
        </td>
    </tr>
    `
}

export default createSpendItemTemplate;
import database from '../database.js';

function createExpenseItemTemplate ({ expenseItem }) {
    const expenseQuery = database.prepare(`
        SELECT
            name,
            amount,
            date
        FROM
            expense
        WHERE
            key = ?
    `);

    const expense = expenseQuery.get(expenseItem);

    return /*html*/`
        <tr>
            <td><input id="item-name" name="item_name" type="text" size="10" value="${expense.name}"></input></td>
            <td><input id="item-amount" name="item_amount" type="text" size="8" value="${expense.amount.toFixed(2)}"></input></td>
            <td><input id="item-date" name="item_date" type="date" value="${expense.date}"></input></td>
            <td>
                <span hx-put="/expense/${expenseItem}/" hx-target="#expense-table" hx-swap="outerHTML" hx-include="#item-name, #item-amount, #item-date">Save</span>
                | <span hx-delete="/expense/${expenseItem}/" hx-target="#expense-table" hx-swap="outerHTML">Delete</span>
            </td>
        </tr>
    `;
}

export default createExpenseItemTemplate;

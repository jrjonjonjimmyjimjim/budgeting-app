import database from '../database.js';

async function createExpenseItemTemplate ({ spendItem }) {
    const spend_itemQuery = database.prepare(`
        SELECT
            name,
            amount,
            date
        FROM
            expense
        WHERE
            key = ?
    `);

    const spend_item = spend_itemQuery.get(spendItem);

    return /*html*/`
        <tr>
            <td><input id="item-name" name="item_name" type="text" value="${spend_item.name}"></input></td>
            <td><input id="item-amount" name="item_amount" type="text" value="${spend_item.amount.toFixed(2)}"></input></td>
            <td><input id="item-date" name="item_date" type="date" value="${spend_item.date}"></input></td>
            <td>
                <span hx-put="/expense/${spendItem}/" hx-target="#expense-table" hx-swap="outerHTML" hx-include="#item-name, #item-amount, #item-date">Save</span>
                | <span hx-delete="/expense/${spendItem}/" hx-target="#expense-table" hx-swap="outerHTML">Delete</span>
            </td>
        </tr>
    `;
}

export default createExpenseItemTemplate;

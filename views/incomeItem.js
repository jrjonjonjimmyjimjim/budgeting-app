import _ from 'lodash';
import database from '../database.js';

function createIncomeItemTemplate({ incomeItem }) {
    const itemQuery = database.prepare(`
        SELECT
            name,
            amount
        FROM
            income_item
        WHERE
            key = ?
        ORDER BY name
    `);
    const item = itemQuery.get(incomeItem);

    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" value="${item.name}"></input></td>
        <td><input id="item-amount" name="item_amount" type="text" value="${item.amount.toFixed(2)}"></input></td>
        <td>
            <span hx-put="/income/${incomeItem}/" hx-target="closest div" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
            | <span hx-delete="/income/${incomeItem}/" hx-target="closest div" hx-swap="outerHTML">Delete</span>
        </td>
    </tr>
    `;
}

export default createIncomeItemTemplate;
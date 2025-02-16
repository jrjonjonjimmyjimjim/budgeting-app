import _ from 'lodash';
import sql from '../sql.js';

async function createIncomeItemTemplate({ month, name }) {
    const [item] = await sql`
        SELECT
            name,
            amount
        FROM
            income_item
        WHERE
            month = ${month}
            AND name = ${name}
        ORDER BY name
    `

    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" value="${item.name}"></input></td>
        <td><input id="item-amount" name="item_amount" type="text" value="${item.amount}"></input></td>
        <td>
            <span hx-put="/${month}/income/${name}/" hx-target="closest div" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
            | <span hx-delete="/${month}/income/${name}/" hx-target="closest div" hx-swap="outerHTML">Delete</span>
        </td>
    </tr>
    `
}

export default createIncomeItemTemplate;
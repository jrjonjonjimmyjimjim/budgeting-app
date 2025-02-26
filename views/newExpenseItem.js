import database from '../database.js';

async function createNewExpenseItemTemplate ({ spendItem }) {

    return /*html*/`
        <tr>
            <td><input id="item-name" name="item_name" type="text" value=""></input></td>
            <td><input id="item-amount" name="item_amount" type="text" value=""></input></td>
            <td><input id="item-date" name="item_date" type="date" value=""></input></td>
            <td>
                <span hx-post="/expense/new_item/${spendItem}/" hx-target="#expense-table" hx-swap="outerHTML" hx-include="#item-name, #item-amount, #item-date">Save</span>
            </td>
        </tr>
    `;
}

export default createNewExpenseItemTemplate;

import database from '../database.js';

function createNewExpenseItemTemplate ({ spendItem }) {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset();
    const todayTimeDateString = new Date(today - (timezoneOffset * 60 * 1000)).toISOString();
    const todayDateString = todayTimeDateString.split('T')[0];
    return /*html*/`
        <tr>
            <td><input id="item-name" name="item_name" type="text" size="10" value=""></input></td>
            <td><input id="item-amount" name="item_amount" type="text" size="8" value=""></input></td>
            <td><input id="item-date" name="item_date" type="date" value="${todayDateString}"></input></td>
            <td>
                <span hx-post="/expense/new_item/${spendItem}/" hx-target="#expense-table" hx-swap="outerHTML" hx-include="#item-name, #item-amount, #item-date">Save</span>
            </td>
        </tr>
    `;
}

export default createNewExpenseItemTemplate;

import _ from 'lodash';

function createNewIncomeItemTemplate({ month }) {
    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" size="10" value=""></input></td>
        <td><input id="item-amount" name="item_amount" type="text" inputmode="decimal" size="8" value=""></input></td>
        <td>
            <span hx-post="/income/new_item/${month}" hx-target="#income-table" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
        </td>
    </tr>
    `
}

export default createNewIncomeItemTemplate;
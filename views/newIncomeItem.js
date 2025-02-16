import _ from 'lodash';

async function createNewIncomeItemTemplate({ month }) {
    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" value=""></input></td>
        <td><input id="item-amount" name="item_amount" type="text" value=""></input></td>
        <td>
            <span hx-post="/${month}/income/" hx-target="closest div" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
        </td>
    </tr>
    `
}

export default createNewIncomeItemTemplate;
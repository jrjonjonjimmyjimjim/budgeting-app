import _ from 'lodash';

function createNewSpendItemTemplate({ month, category }) {
    return /*html*/`
    <tr>
        <td><input id="item-name" name="item_name" type="text" size="10" value=""></input></td>
        <td><input id="item-amount" name="item_amount" type="text" size="8" value=""></input></td>
        <td>---</td>
        <td>---</td>
        <td>
            <span hx-post="/spend/new_item/${month}/${category}/" hx-target="#spend-${category}" hx-swap="outerHTML" hx-include="#item-name, #item-amount">Save</span>
        </td>
    </tr>
    `
}

export default createNewSpendItemTemplate;
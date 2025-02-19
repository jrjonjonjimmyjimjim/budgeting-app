import _ from 'lodash';

function createNewSpendTableTemplate({ month }) {
    return /*html*/`
    <div>
        <input id="category-name" name="category_name" type="text" placeholder="Category Name" value=""></input>
        <span hx-post="/new_spend_table/${month}/" hx-target="closest div" hx-swap="outerHTML" hx-include="#category-name">Save</span>
    </div>
    `
}

export default createNewSpendTableTemplate;
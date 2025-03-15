import _ from 'lodash';

function createNewSpendTableTemplate({ month }) {
    return /*html*/`
    <div id="new-spend" class="card bg-spend">
        <div class="card-header">
            <input id="category-name" name="category_name" type="text" placeholder="Category Name" value=""></input>
            <span hx-post="/new_spend_table/${month}/" hx-target="#new-spend" hx-swap="outerHTML" hx-include="#category-name">Save</span>
        </div>
        <div class="card-body"></div>
    </div>
    `
}

export default createNewSpendTableTemplate;
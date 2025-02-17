import _ from 'lodash';
import database from '../database.js';

async function createIncomeTableTemplate ({ month }) {
    const itemsQuery = database.prepare(`
        SELECT
            key,
            name,
            amount
        FROM
            income_item
        WHERE
            month = ?
        ORDER BY name
    `);
    const items = itemsQuery.all(month);

    return /*html*/`
    <div>
    <h2>Income</h2>
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Amount</th>
                <th scope="col">Edit</th>
            </tr>
        </thead>
        <tbody>
            ${
                _.chain(items)
                    .map((item) => 
                        /*html*/`
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.amount.toFixed(2)}</td>
                                <td hx-get="/income/${item.key}" hx-target="closest tr" hx-swap="outerHTML">Edit</td>
                            </tr>
                        `
                    )
                    .join('')
                    .value()
            }
            <tr class="total-line">
                <td>TOTAL</td>
                <td>${(_.sumBy(items, (item) => item.amount)).toFixed(2)}</td>
                <td hx-get="/income/new_item/${month}" hx-target="closest tr" hx-swap="beforebegin">New</td>
            </tr>
        </tbody>
    </table>
    </div>
    `;
}

export default createIncomeTableTemplate;
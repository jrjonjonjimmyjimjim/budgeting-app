import _ from 'lodash';
import sql from '../sql.js';

async function createIncomeTableTemplate ({ month }) {
    const items = await sql`
        SELECT
            name,
            amount
        FROM
            income_item
        WHERE
            month = ${month}
        ORDER BY name
    `;

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
                                <td>${item.amount}</td>
                                <td hx-get="/${month}/income/${item.name}/" hx-target="closest tr" hx-swap="outerHTML">Edit</td>
                            </tr>
                        `
                    )
                    .join('')
                    .value()
            }
            <tr class="total-line">
                <td>TOTAL</td>
                <td>${(_.sumBy(items, (item) => Number(item.amount))).toFixed(2)}</td>
                <td hx-get="/${month}/income/new_item/">New</td>
            </tr>
        </tbody>
    </table>
    </div>
    `;
}

export default createIncomeTableTemplate;
import _ from 'lodash';
import database from '../database.js';

function createSpendTableTemplate ({ month, category, outOfBand }) {
    const spendItemsQuery = database.prepare(`
        SELECT
            key,
            name,
            amount,
            category,
            is_tracked
        FROM
            spend_item
        WHERE
            month = ?
            AND category = ?
        ORDER BY name
    `);
    const spendItems = spendItemsQuery.all(month, category);
    if (_.size(spendItems) === 0) {
        return '';
    }
    // Let it be known that I find this IN clause construction disgusting
    const spendItemsFilter = `(${_.map(spendItems, 'key')})`;
    const expensesQuery = database.prepare(`
        SELECT
            name,
            amount,
            date,
            spend_item
        FROM
            expense
        WHERE
            spend_item IN ${spendItemsFilter}
        ORDER BY date
    `);
    const expenses = expensesQuery.all();

    const expensesBySpendItem = _.groupBy(expenses, 'spend_item');
    const items = _.map(spendItems, (spendItem) => {
        const expensesForSpendItem = expensesBySpendItem[spendItem.key];
        const totalExpensesForSpendItem = spendItem.is_tracked ? _.sumBy(expensesForSpendItem, 'amount') : spendItem.amount;
        return {
            key: spendItem.key,
            name: spendItem.name,
            amount: spendItem.amount,
            spent: totalExpensesForSpendItem,
            remain: (spendItem.amount - totalExpensesForSpendItem),
        };
    });


    return /*html*/`
        <div id="spend-${category}" class="card bg-spend" ${outOfBand ? `hx-swap-oob="true"` : ``}>
            <div class="card-header">
                <h2>${category}</h2>
            </div>
            <div class="card-body">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Spent</th>
                            <th scope="col">Remain</th>
                            <th scope="col">Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            _.chain(items)
                                .map((item) =>
                                    /*html*/`
                                        <tr>
                                            <td hx-get="/spend/${item.key}/expense/" hx-target="#expense-table" hx-swap="outerHTML">${item.name}</td>
                                            <td>${item.amount.toFixed(2)}</td>
                                            <td>${item.spent.toFixed(2)}</td>
                                            <td>${item.remain.toFixed(2)}</td>
                                            <td hx-get="/spend/${item.key}/" hx-target="closest tr" hx-swap="outerHTML">Edit</td>
                                        </tr>
                                    `
                                )
                                .join('')
                                .value()
                        }
                        <tr class="total-line">
                            <td>TOTAL</td>
                            <td>${(_.sumBy(items, 'amount')).toFixed(2)}</td>
                            <td>${(_.sumBy(items, 'spent')).toFixed(2)}</td>
                            <td>${(_.sumBy(items, 'remain')).toFixed(2)}</td>
                            <td hx-get="/spend/new_item/${month}/${category}" hx-target="closest tr" hx-swap="beforebegin">New</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export default createSpendTableTemplate;
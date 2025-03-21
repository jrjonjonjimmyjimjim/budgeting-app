import _ from 'lodash';
import database from '../database.js';

function createSpendTablesTemplate ({ month }) {
    const spendItemsRawQuery = database.prepare(`
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
        ORDER BY name
    `);
    const spendItemsRaw = spendItemsRawQuery.all(month);
    // Let it be known that I find this IN clause construction disgusting
    const spendItemsFilter = `(${_.map(spendItemsRaw, 'key')})`;
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

    const spendItemsByCategory = _.groupBy(spendItemsRaw, 'category');
    const expensesBySpendItem = _.groupBy(expenses, 'spend_item');
    const spendCategories = _.map(spendItemsByCategory, (spendItems, category) => {
        const items = _.map(spendItems, (spendItem) => {
            const expensesForSpendItem = expensesBySpendItem[spendItem.key];
            const totalExpensesForSpendItem = spendItem.is_tracked ? _.sumBy(expensesForSpendItem, 'amount') : spendItem.amount;
            return {
                key: spendItem.key,
                name: spendItem.name,
                amount: spendItem.amount,
                spent: totalExpensesForSpendItem,
                remain: spendItem.amount - totalExpensesForSpendItem,
            };
        });
        return {
            category,
            items,
        };
    });

    return /*html*/`
    ${
        _.chain(spendCategories)
            .map((spendCategory) =>
                /*html*/`
                    <div id="spend-${spendCategory.category}" class="card bg-spend">
                        <div class="card-header">
                            <h2>${spendCategory.category}</h2>
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
                                        _.chain(spendCategory.items)
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
                                        <td>${(_.sumBy(spendCategory.items, 'amount')).toFixed(2)}</td>
                                        <td>${(_.sumBy(spendCategory.items, 'spent')).toFixed(2)}</td>
                                        <td>${(_.sumBy(spendCategory.items, 'remain')).toFixed(2)}</td>
                                        <td hx-get="/spend/new_item/${month}/${spendCategory.category}" hx-target="closest tr" hx-swap="beforebegin">New</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `
            )
            .join('')
            .value()
    }
    `;
}

export default createSpendTablesTemplate;
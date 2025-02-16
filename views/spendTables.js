import _ from 'lodash';
import sql from '../sql.js';

async function createSpendTablesTemplate ({ month }) {
    const spendItemsRaw = await sql`
        SELECT
            name,
            amount,
            category,
            is_tracked
        FROM
            spend_item
        WHERE
            month = ${month}
        ORDER BY name
    `;
    const expenses = await sql`
        SELECT
            name,
            amount,
            date,
            spend_item
        FROM
            expense
        WHERE
            month = ${month}
        ORDER BY name
    `;

    const spendItemsByCategory = _.groupBy(spendItemsRaw, 'category');
    const expensesBySpendItem = _.groupBy(expenses, 'spend_item');
    const spendCategories = _.map(spendItemsByCategory, (spendItems, category) => {
        const items = _.map(spendItems, (spendItem) => {
            const expensesForSpendItem = expensesBySpendItem[spendItem.name];
            const totalExpensesForSpendItem = _.sumBy(expensesForSpendItem, (expenseForSpendItem) => Number(expenseForSpendItem.amount));
            return {
                name: spendItem.name,
                amount: spendItem.amount,
                spent: totalExpensesForSpendItem.toFixed(2),
                remain: (Number(spendItem.amount) - totalExpensesForSpendItem).toFixed(2),
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
                    <h2>${spendCategory.category}</h2>
                    <table class="table">
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
                                                <td>${item.name}</td>
                                                <td>${item.amount}</td>
                                                <td>${item.spent}</td>
                                                <td>${item.remain}</td>
                                                <td>Edit</td>
                                            </tr>
                                        `
                                    )
                                    .join('')
                                    .value()
                            }
                            <tr class="total-line">
                                <td>TOTAL</td>
                                <td>${(_.sumBy(spendCategory.items, (item) => Number(item.amount))).toFixed(2)}</td>
                                <td>${(_.sumBy(spendCategory.items, (item) => Number(item.spent))).toFixed(2)}</td>
                                <td>${(_.sumBy(spendCategory.items, (item) => Number(item.remain))).toFixed(2)}</td>
                                <td>New</td>
                            </tr>
                        </tbody>
                    </table>
                `
            )
            .join('')
            .value()
    }
    `;
}

export default createSpendTablesTemplate;
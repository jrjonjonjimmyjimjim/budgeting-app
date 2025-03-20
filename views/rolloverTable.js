import _ from 'lodash';
import database from '../database.js';

function createRolloverTableTemplate ({ month }) {

    function _calculatePreviousMonth ({ month }) {
        const fullString = `${month}`;
        const yearString = fullString.substring(0, 4);
        const monthString = fullString.substring(4);
        const yearInt = Number(yearString);
        const monthInt = Number(monthString);
        let prevMonthInt = monthInt - 1;
        let prevYearInt = yearInt;

        if (prevMonthInt <= 0) {
            prevYearInt -= 1;
            prevMonthInt = 12;
        }

        let prevMonthString;
        if (prevMonthInt < 10) {
            prevMonthString = `0${prevMonthInt}`;
        } else {
            prevMonthString = `${prevMonthInt}`;
        }

        return Number(`${prevYearInt}${prevMonthString}`);
    }

    const previousMonth = _calculatePreviousMonth({ month });
    const spendItemsRawQuery = database.prepare(`
        SELECT
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
    const spendItemsRaw = spendItemsRawQuery.all(previousMonth);
    const expensesQuery = database.prepare(`
        SELECT
            expense.name name,
            expense.amount amount,
            expense.date date,
            expense.spend_item spend_item
        FROM
            expense
            INNER JOIN spend_item ON (expense.spend_item = spend_item.key)
        WHERE
            spend_item.month = ?
        ORDER BY name
    `);
    const expenses = expensesQuery.all(previousMonth);

    const spendItemsByCategory = _.groupBy(spendItemsRaw, 'category');
    const rolloverLines = _.map(spendItemsByCategory, (spendItems, category) => {
        const categoryStartAmount = _.sumBy(spendItems, (spendItem) => {
            if (!spendItem.is_tracked) {
                return 0;
            }
            return spendItem.amount;
        });
        const expensesForCategory = _.filter(expenses, (expense) =>
            _.some(spendItems, (spendItem) => spendItem.name === expense.spend_item)
        );
        const expensesAmount = _.sumBy(expensesForCategory, 'amount');
        return {
            category,
            amount: categoryStartAmount - expensesAmount,
        };
    });
    
    return /*html*/`
    <div class="card bg-income">
        <div class="card-header">
            <h2>Rollover</h2>
        </div>
        <div class="card-body">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        _.chain(rolloverLines)
                            .map((rolloverLine) => 
                                /*html*/`
                                    <tr>
                                        <td>${rolloverLine.category}</td>
                                        <td>${rolloverLine.amount.toFixed(2)}</td>
                                    </tr>
                                `
                            )
                            .join('')
                            .value()
                    }
                    <tr class="total-line">
                        <td>TOTAL</td>
                        <td>${(_.sumBy(rolloverLines, 'amount')).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `;
}

export default createRolloverTableTemplate;
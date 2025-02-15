import _ from 'lodash';
import sql from '../sql.js';

async function createRolloverTableTemplate ({ month }) {

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
    const spendItems = await sql`
        SELECT
            name,
            amount,
            category,
            is_tracked
        FROM
            spend_item
        WHERE
            month = ${previousMonth}
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
            month = ${previousMonth}
    `;

    const spendItemsByCategory = _.groupBy(spendItems, 'category');
    const rolloverLines = _.map(spendItemsByCategory, (spendItems, category) => {
        const categoryStartAmount = _.sumBy(spendItems, (spendItem) => {
            if (!spendItem.is_tracked) {
                return 0;
            }
            return Number(spendItem.amount);
        });
        const expensesForCategory = _.filter(expenses, (expense) =>
            _.some(spendItems, (spendItem) => spendItem.name === expense.spend_item)
        );
        const expensesAmount = _.sumBy(expensesForCategory, (expenseForCategory) => Number(expenseForCategory.amount));
        return {
            category,
            amount: (categoryStartAmount - expensesAmount).toFixed(2),
        };
    });
    
    return /*html*/`
    <h2>Rollover</h2>
    <table class="table">
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
                                <td>${rolloverLine.amount}</td>
                            </tr>
                        `
                    )
                    .join('')
                    .value()
            }
            <tr class="total-line">
                <td>TOTAL</td>
                <td>${(_.sumBy(rolloverLines, (rolloverLine) => Number(rolloverLine.amount))).toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    `;
}

export default createRolloverTableTemplate;
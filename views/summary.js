import _ from 'lodash';
import database from '../database.js';

function createSummaryTemplate ({ month }) {
    const incomeItemsQuery = database.prepare(`
        SELECT
            name,
            amount
        FROM
            income_item
        WHERE
            month = ?
        ORDER BY name
    `);
    const incomeItems = incomeItemsQuery.all(month);
    const spendItemsQuery = database.prepare(`
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
    const spendItems = spendItemsQuery.all(month);

    // copy-pasta
    //
    //
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
    const prevMonthSpendItemsRawQuery = database.prepare(`
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
    const prevMonthSpendItemsRaw = prevMonthSpendItemsRawQuery.all(previousMonth);
    const prevMonthExpensesQuery = database.prepare(`
        SELECT
            name,
            amount,
            date,
            spend_item
        FROM
            expense
        WHERE
            month = ?
        ORDER BY name
    `);
    const prevMonthExpenses = prevMonthExpensesQuery.all(previousMonth);

    const spendItemsByCategory = _.groupBy(prevMonthSpendItemsRaw, 'category');
    // leaving this copy pasta so that once i refactor, summary.js can just take in `rolloverLines`
    const rolloverLines = _.map(spendItemsByCategory, (spendItems, category) => {
        const categoryStartAmount = _.sumBy(spendItems, (spendItem) => {
            if (!spendItem.is_tracked) {
                return 0;
            }
            return spendItem.amount;
        });
        const expensesForCategory = _.filter(prevMonthExpenses, (expense) =>
            _.some(spendItems, (spendItem) => spendItem.name === expense.spend_item)
        );
        const expensesAmount = _.sumBy(expensesForCategory, 'amount');
        return {
            category,
            amount: categoryStartAmount - expensesAmount,
        };
    });
    //
    //
    //    

    const totalToAllocate = _.sumBy(incomeItems, 'amount') + _.sumBy(rolloverLines, 'amount');
    const totalAllocated = _.sumBy(spendItems, 'amount');

    return /*html*/`
    <div class="card bg-summary" hx-get="/summary/${month}" hx-trigger="recalc-totals from:body" hx-swap="outerHTML">
        <div class="card-header">
            <h1>Summary</h1>
        </div>
        <div class="card-body">
            <div class="container">
                <div class="row">
                    <div class="col-7">
                        <h2>Total to allocate</h2>
                    </div>
                    <div class="col-5">
                        <h4 class="text-end">${totalToAllocate.toFixed(2)}</h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col-7">
                        <h2>Allocated</h2>
                    </div>
                    <div class="col-5">
                        <h4 class="text-end">${totalAllocated.toFixed(2)}</h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col-7">
                        <h2>Remain to allocate</h2>
                    </div>
                    <div class="col-5">
                        <h4 class="text-end">${(totalToAllocate - totalAllocated).toFixed(2)}</h4>
                    </div>
                </div>
            </div>
            ${
                _.size(spendItems) === 0
                ? `<a href="/copy/${_calculatePreviousMonth({ month })}/${month}/">Copy previous month</a>`
                : ``
            }
        </div>
    </div>
    `;
}

export default createSummaryTemplate;
import createIncomeTableTemplate from "./incomeTable.js";
import createRolloverTableTemplate from "./rolloverTable.js";
import createSpendTablesTemplate from "./spendTables.js";
import createSummaryTemplate from "./summary.js";
import createExpensesTemplate from "./expenseTable.js";

function _calculateMonthString ({ month }) {
    const monthString = `${month}`;
    const year = monthString.substring(0, 4);
    const monthFinal = monthString.substring(4);
    return `${monthFinal}/${year}`;
}

function _calculateOtherMonth ({ month, difference }) {
    const fullString = `${month}`;
    const yearString = fullString.substring(0, 4);
    const monthString = fullString.substring(4);
    const yearInt = Number(yearString);
    const monthInt = Number(monthString);
    let otherMonthInt = monthInt + difference;
    let otherYearInt = yearInt;

    if (otherMonthInt <= 0) {
        otherYearInt -= 1;
        otherMonthInt = 12;
    } else if (otherMonthInt >= 13) {
        otherYearInt += 1;
        otherMonthInt = 1;
    }

    let otherMonthString;
    if (otherMonthInt < 10) {
        otherMonthString = `0${otherMonthInt}`;
    } else {
        otherMonthString = `${otherMonthInt}`;
    }

    return Number(`${otherYearInt}${otherMonthString}`);
}

function createRootTemplate ({ month }) {
    return /*html*/`
    <html>
    <head>
        <script src="/js/bootstrap.js" defer></script>
        <script src="/js/htmx.min.js" defer></script>
        <link href="/css/bootstrap.css" rel="stylesheet">
    </head>
    <body>
        <h1><a href="/month/${_calculateOtherMonth({ month, difference: -1 })}">&lt;</a> ${_calculateMonthString({ month })} <a href="/month/${_calculateOtherMonth({ month, difference: 1 })}">&gt;</a></h1>
        <div class="container">
            <div class="row">
                <div class="col-8 vstack gap-3">
                    ${ createRolloverTableTemplate({ month })}
                    ${ createIncomeTableTemplate({ month })}
                    <hr>
                    ${ createSpendTablesTemplate({ month })}
                    <h2 hx-get="/new_spend_table/${month}/" hx-swap="beforebegin">New Category</h2>
                </div>
                <div class="col-4">
                    ${ createSummaryTemplate({ month })}
                    ${ createExpensesTemplate({ month, spendItem: null })}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export default createRootTemplate;
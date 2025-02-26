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

async function createRootTemplate ({ month }) {
    return /*html*/`
    <html>
    <head>
        <script src="/js/bootstrap.js" defer></script>
        <script src="/js/htmx.min.js" defer></script>
        <link href="/css/bootstrap.css" rel="stylesheet">
    </head>
    <body>
        <h1>${_calculateMonthString({ month })}</h1>
        <div class="container">
            <div class="row">
                <div class="col-8 vstack gap-3">
                    ${await createRolloverTableTemplate({ month })}
                    ${await createIncomeTableTemplate({ month })}
                    <hr>
                    ${await createSpendTablesTemplate({ month })}
                    <h2 hx-get="/new_spend_table/${month}/" hx-swap="beforebegin">New Category</h2>
                </div>
                <div class="col-4">
                    ${await createSummaryTemplate({ month })}
                    ${await createExpensesTemplate({ month, spendItem: null })}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export default createRootTemplate;
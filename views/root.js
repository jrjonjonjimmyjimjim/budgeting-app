import createIncomeTableTemplate from "./incomeTable.js";
import createRolloverTableTemplate from "./rolloverTable.js";
import createExpenseTablesTemplate from "./expenseTables.js";
import createSummaryTemplate from "./summary.js";

async function createRootTemplate ({ month }) {
    return /*html*/`
    <html>
    <head>
        <script src="/js/bootstrap.js" defer></script>
        <script src="/js/htmx.min.js" defer></script>
        <link href="/css/bootstrap.css" rel="stylesheet">
    </head>
    <body>
        <h1>Hello world!</h1>
        <div class="container">
            <div class="row">
                <div class="col-7">
                    ${await createRolloverTableTemplate({ month })}
                    ${await createIncomeTableTemplate({ month })}
                    ${createExpenseTablesTemplate()}
                </div>
                <div class="col-5">
                    ${createSummaryTemplate()}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export default createRootTemplate;
import createIncomeTableTemplate from "./incomeTable.js";
import createRolloverTableTemplate from "./rolloverTable.js";
import createSpendTablesTemplate from "./spendTables.js";
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
                <div class="col-8 vstack gap-3">
                    ${await createRolloverTableTemplate({ month })}
                    ${await createIncomeTableTemplate({ month })}
                    <hr>
                    ${await createSpendTablesTemplate({ month })}
                </div>
                <div class="col-4">
                    ${await createSummaryTemplate({ month })}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export default createRootTemplate;
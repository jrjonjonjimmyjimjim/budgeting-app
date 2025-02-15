import createIncomeTableTemplate from "./incomeTable.js";
import createRolloverTableTemplate from "./rolloverTable.js";
import createExpenseCategoriesTemplate from "./expenseCategories.js";
import createSummaryTemplate from "./summary.js";

function createRootTemplate () {
    return /*html*/`
    <html>
    <head>
        <script src="/js/bootstrap.js" defer></script>
        <link href="/css/bootstrap.css" rel="stylesheet">
    </head>
    <body>
        <h1>Hello world!</h1>
        <div class="container">
            <div class="row">
                <div class="col-7">
                    ${createRolloverTableTemplate()}
                    ${createIncomeTableTemplate()}
                    <div id="total-to-allocate-line">Total to allocate: $5320.27</div>
                    ${createExpenseCategoriesTemplate()}
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
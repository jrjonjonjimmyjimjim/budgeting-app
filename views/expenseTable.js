import _ from 'lodash';
import database from '../database.js';

function createExpenseTableTemplate ({ spendItem }) {
    if (!spendItem) {
        return /*html*/`
            <div id="expense-table" class="card bg-expense">
                <div class="card-header">
                    <h4>Select Spend Item to Track Expense</h4>
                </div>
            </div>
        `;
    }

    const spend_itemQuery = database.prepare(`
        SELECT
            name,
            category,
            is_tracked,
            notes
        FROM
            spend_item
        WHERE
            key = ?
    `);
    const spend_item = spend_itemQuery.get(spendItem);

    const expensesQuery = database.prepare(`
        SELECT
            key,
            name,
            amount,
            date
        FROM
            expense
        WHERE
            spend_item = ?
        ORDER BY
            date
    `);
    const expenses = expensesQuery.all(spendItem);

    return /*html*/`
        <div id="expense-table" class="card bg-expense">
            <div class="card-header">
                <h2>Expenses for ${spend_item.name}</h2>
            </div>
            <div class="card-body">
                <div class="container">
                    <div class="row">
                        <div class="col">
                            <div class="vstack gap-2">
                                <div>
                                    <label for="is_tracked">Track Expenses</label>
                                    <input hx-put="/spend/${spendItem}/tracked/" hx-target="#spend-${spend_item.category}" hx-swap="outerHTML" hx-include="#is-tracked" id="is-tracked" name="is_tracked" type="checkbox" ${spend_item.is_tracked ? `checked` : ``}></input>
                                </div>
                                <h3 hx-put="/spend/${spendItem}/notes/" hx-swap="none" hx-include="#notes" class="btn btn-light">Save Notes</h3>
                            </div>
                        </div>
                        <div class="col">
                            <textarea id="notes" name="notes" rows="3" cols="30">${spend_item.notes ?? ''}</textarea>
                        </div>
                    </div>
                </div>
                <hr>
                <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Vendor</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Date</th>
                        <th scope="col">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        _.chain(expenses)
                            .map((expense) =>
                                /*html*/`
                                    <tr>
                                        <td>${expense.name}</td>
                                        <td>${expense.amount.toFixed(2)}</td>
                                        <td>${expense.date}</td>
                                        <td hx-get="/expense/${expense.key}/" hx-target="closest tr" hx-swap="outerHTML">Edit</td>
                                    </tr>
                                `
                            )
                            .join('')
                            .value()
                    }
                    <tr class="total-line">
                        <td>---</td>
                        <td>${(_.sumBy(expenses, 'amount')).toFixed(2)}</td>
                        <td>---</td>
                        <td hx-get="/expense/new_item/${spendItem}/" hx-target="closest tr" hx-swap="beforebegin">New</td>
                    </tr>
                </tbody>
                </table>
            </div>
        </div>
    `;
}

export default createExpenseTableTemplate;
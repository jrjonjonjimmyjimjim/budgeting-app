function createExpenseTablesTemplate () {
    return /*html*/`
    <h2>Transportation</h2>
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
            <tr>
                <td>Gas</td>
                <td>300.00</td>
                <td>75.00</td>
                <td>225.00</td>
                <td>Edit</td>
            </tr>
            <tr class="total-line">
                <td>TOTAL (Calculated)</td>
                <td>4,000.00</td>
                <td>250.00</td>
                <td>3,750.00</td>
            </tr>
        </tbody>
    </table>
    `;
}

export default createExpenseTablesTemplate;
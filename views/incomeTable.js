function createIncomeTableTemplate () {
    return /*html*/`
    <h2>Income</h2>
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Amount</th>
                <th scope="col">Edit</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Paycheck 1 (dynamic)</td>
                <td>2,000.00</td>
                <td>Edit</td>
            </tr>
            <tr class="total-line">
                <td>TOTAL (Calculated)</td>
                <td>4,000.00</td>
            </tr>
        </tbody>
    </table>
    `;
}

export default createIncomeTableTemplate;
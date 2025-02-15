function createRolloverTableTemplate () {
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
            <tr>
                <td>Transportation (Calculated)</td>
                <td>2,000.00</td>
            </tr>
            <tr class="total-line">
                <td>TOTAL (Calculated)</td>
                <td>4,000.00</td>
            </tr>
        </tbody>
    </table>
    `;
}

export default createRolloverTableTemplate;
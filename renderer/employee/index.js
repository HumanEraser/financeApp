document.addEventListener('DOMContentLoaded', async () =>{
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const formPage = document.getElementById('transactionForm');
    const modalForm = new bootstrap.Modal(document.getElementById('addTransactionModal'));
    const transactionDiv = document.getElementById('myTransactions');
    const typeSelect = document.getElementById('addType');
    const currentUser = await window.api.getCurrentUser();
    console.log(currentUser);

    // Open Add Transaction
    addTransactionBtn.addEventListener('click', async () =>{
        formPage.reset();
        modalForm.show();
    })

    // Change category
    typeSelect.addEventListener('change', async() =>{
        let categorySelect = document.getElementById('addCategory');
        const selectedType = typeSelect.value;
        categorySelect.innerHTML = "";
        if(selectedType == "income"){
            categorySelect.innerHTML = `
                <option value="0" disabled selected>Select Category</option>
                <option value="Salary">Salary - Wages, Bonuses, Commissions</option>
                <option value="Business">Business Profits</option>
                <option value="Investments">Investments</option>
                <option value="Freelance">Freelance</option>
                <option value="Refunds">Refunds / Rebates</option>
            `;
        }else if(selectedType == "expense"){
            categorySelect.innerHTML = `
                <option value="0" disabled selected>Select Category</option>
                <option value="Essential Expenses">Essential Expenses - Rent / Mortgage , Utilities, Transportation, Groceries
                </option>
                <option value="Financial Commitments">Financial Commitments - Dept Payments, Savings & Investments, Insurance
                </option>
                <option value="Lifestyle & Leisure">Lifestyle & Leisure - Entertainment, Dinning Out, Shopping</option>
                <option value="Personal & Professional Growth">Personal & Professional Growth - Education, Work Expenses</option>
                <option value="Miscellaneous">Miscellaneous - Gifts & Donations, Health & Wellness</option>
            `;
        }
    })

    // Submit Transaction
    formPage.addEventListener('submit', async (event) =>{
        event.preventDefault();
        let doContinue = false;
        var amount = document.getElementById('addAmount').value;
        var type = document.getElementById('addType').value;
        var category = document.getElementById('addCategory').value;
        var rawDate = new Date(document.getElementById('addDate').value);
        var formattedDate = `${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getDate().toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
        var note  = document.getElementById('addNote').value;
        doContinue = checkData(amount,type,category,formattedDate)
        if(doContinue){
            const transactionData = {
                amount: amount,
                type: type,
                category: category,
                date: formattedDate,
                note: note,
                userId: currentUser.id
            }
            try{
                const result = await window.api.addTransaction(transactionData);
                console.log(result);
                swal({
                    title: "Success",
                    text: "Transaction added successfully",
                    icon: "success",
                    button: "OK",
                }).then(() => {
                    modalForm.hide();
                    formPage.reset();
                    window.location.reload();
                });
            }catch (error){
                console.error("Error adding transaction:", error);
            }
        }else{
            swal("Error","Fill out the form", "warning")
        }
    })

    async function checkData(amount,type,category,formattedDate) {
        const data = [amount, type, category, formattedDate];
        var count = 0
        data.forEach(element => {
            if(element == "" || element == "NaN/NaN/NaN"){
                
            }else{
                count++
            }
        });
        if(count == data.length){
            return true
        }else{
            return false
        }
    }

    //load transactions
    async function loadTransaction() {
        let table = document.createElement('table');
        table.classList.add("table", "table-striped", "table-bordered", "table-hover", "table-sm", "mt-2")
        
        let myTrasactionlist = await window.api.getMyTransaction(currentUser.id)
        document.getElementById('employeeHead').innerHTML = `Welcome: ` + currentUser.username;
        console.log(myTrasactionlist)
        if(myTrasactionlist.length == 0){
            table.innerHTML = "No data can be shown"
        }else{
            table.innerHTML += `
            <thead class="table-dark">
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Note</th>
                </tr>
                </tr>
            </thead>
            <tbody>
                ${myTrasactionlist.map(transaction => `
                <tr>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>${Number(transaction.amount).toLocaleString('en-US', {maximumFractionDigits:2,minimumFractionDigits:2})}</td>
                <td>${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>${transaction.note}</td>
                </tr>`).join('')}
            </tbody>
            `
        }
        transactionDiv.innerHTML = ""
        transactionDiv.appendChild(table)
    }

    loadTransaction();
})



function logout() {
    window.api.logout();
    window.location = '../index.html';
}
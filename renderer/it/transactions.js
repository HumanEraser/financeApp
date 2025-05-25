document.addEventListener("DOMContentLoaded", async () => {
    const transactionTableCont = document.getElementById("transactionList");
    const addTransactionBtn = document.getElementById("addTransactionBtn");
    const addTransaction = new bootstrap.Modal(document.getElementById("addTransactionModal"));
    const transactionForm = document.getElementById("transactionForm")
    const addAmount = document.getElementById("addAmount");
    const typeSelect = document.getElementById("addType");
    const categorySelect = document.getElementById("addCategory");
    const cancelTransactionBtn = document.getElementById("cancelTransactionBtn");
    const addDateInput = document.getElementById("addDate");
    const currentUser = await window.api.getCurrentUser();
    let currentTransactionId = null;
    var isEditing = false;
    var isDeleting = false;
    var isAdding = false;
    // Get today's date in the format yyyy-mm-dd
    const today = new Date().toISOString().split("T")[0];

    // Set the max attribute to today's date
    addDateInput.setAttribute("max", today);
    // Load transaction from the database
    async function loadTransaction() {
    const transactionList = await window.api.transaction();
    transactionTableCont.innerHTML = ""; // Clear the container
    console.log(transactionList);

    // Sort the transactions by date (newest to oldest)
    transactionList.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create the table
    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered", "table-hover", "table-sm", "mb-5");

    table.innerHTML = `
        <thead class="table-dark">
            <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Note</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${transactionList.map(transaction => `
                <tr>
                <td>${transaction.id}</td>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>${Number(transaction.amount).toLocaleString('en-US', {maximumFractionDigits:2,minimumFractionDigits:2})}</td>
                <td>${transaction.category}</td>
                <td>${transaction.type}</td>
                <td>${transaction.note}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editTransaction(${transaction.amount}, '${transaction.category}', '${transaction.date}', '${transaction.type}', '${transaction.note}', '${transaction.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${transaction.id})">Delete</button>
                </td>
                </tr>`).join('')}
        </tbody>
    `;

    transactionTableCont.appendChild(table);
    }

    // Initial load
    loadTransaction();

    // Show modal for new transaction
    addTransactionBtn.addEventListener("click", () => {
        isAdding = true;
        isEditing = false;
        isDeleting = false;
        currentTransactionId = null;
        transactionForm.reset();
        addTransaction.show(); // Show the modal
    });
    typeSelect.addEventListener("change", async () =>{
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
    // Save Transaction

    transactionForm.addEventListener("submit", async (e) =>{
        console.log("submit");
        e.preventDefault();
        if(isAdding){
            saveAddTransaction();
        }else if (isEditing){
            saveEditTransaction();
        }else if(isDeleteing){

        }
    })

    window.cancelTransaction = () =>{
        transactionForm.reset();
        addTransaction.hide();
    }

    // Edit Transaction
    window.editTransaction = (amount, category, date, type, note, id) =>{
        isAdding = false;
        isDeleting = false;
        isEditing = true;
        currentTransactionId = id;
        console.log(amount, category, date, type, note, id);
        addTransaction.show(); // Show the modal
        addAmount.value = amount;
        typeSelect.value = type;
        if(type == "income"){
            typeSelect.innerHTML = `
                <option value="0" disabled>Select Type</option>
                <option value="income" selected>Income</option>
                <option value="expense">Expense</option>
            `;
            categorySelect.innerHTML = `
                <option value="0" disabled selected>Select Category</option>
                <option value="Salary">Salary - Wages, Bonuses, Commissions</option>
                <option value="Business">Business Profits</option>
                <option value="Investments">Investments</option>
                <option value="Freelance">Freelance</option>
                <option value="Refunds">Refunds / Rebates</option>
            `;
        }else if(type == "expense"){
            typeSelect.innerHTML = `
                <option value="0" disabled>Select Type</option>
                <option value="income">Income</option>
                <option value="expense" selected>Expense</option>
            `;
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
        addDateInput.value = convertToISOFormat(new Date(date));
        document.getElementById("addNote").value = note;
    }

    window.deleteTransaction = async (id) =>{
        isAdding = false;
        isEditing = false;
        isDeleting = true;
        currentTransactionId = id;
                    swal({
                title: "Delete Transaction",
                text: "Are you sure you want to delete this transaction?",
                icon: "warning",
                buttons: true,
                dangerMode:true,
                }).then((willDelete) =>{
                    if(willDelete){
                        window.api.deleteTransaction(currentTransactionId).then((result) => {
                            console.log(result);
                            swal({
                                title: "Success",
                                text: "Transaction deleted successfully",
                                icon: "success",
                                button: "OK",
                            }).then(() => {
                                addTransaction.hide();
                                window.location.reload();
                            });
                        }).catch((error) => {
                            console.error("Error deleting transaction:", error);
                        });
                    }
                })
    }

    async function saveAddTransaction(){
        let doContinue = false;
        const amount = addAmount.value;
        const type = typeSelect.value.toString();
        const category = categorySelect.value;
        const rawDate = new Date(document.getElementById("addDate").value);
        const formattedDate = `${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getDate().toString().padStart(2, '0')}/${rawDate.getFullYear()}`
        const note = document.getElementById("addNote").value;

        if(amount == ""){
            swal({
                title: "Error",
                text: "Please enter an amount",
                icon: "error",
                button: "OK",
            });
        }else if(type == "0"){
            swal({
                title: "Error",
                text: "Please select a type",
                icon: "error",
                button: "OK",
            });
        }
        else if(category == "0"){
            swal({
                title: "Error",
                text: "Please select a category",
                icon: "error",
                button: "OK",
            });
        }
        else if(formattedDate == "NaN/NaN/NaN"){
            swal({
                title: "Error",
                text: "Please select a date",
                icon: "error",
                button: "OK",
            });
        }else{
            doContinue = true;
        }

        if(doContinue){
            const transactionData = {
                amount: amount,
                type: type,
                category: category,
                date: formattedDate,
                note: note,
                userId: currentUser.id
            }
            console.log(transactionData);

            try{
                const result = await window.api.addTransaction(transactionData);
                console.log(result);
                swal({
                    title: "Success",
                    text: "Transaction added successfully",
                    icon: "success",
                    button: "OK",
                }).then(() => {
                    addTransaction.hide();
                    window.location.reload();
                });
            }catch (error){
                console.error("Error adding transaction:", error);
            }
        }
    }

    async function saveEditTransaction(){
        let doContinue = false;
        const amount = addAmount.value;
        const type = typeSelect.value.toString();
        const category = categorySelect.value;
        const rawDate = new Date(document.getElementById("addDate").value);
        const formattedDate = `${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getDate().toString().padStart(2, '0')}/${rawDate.getFullYear()}`
        const note = document.getElementById("addNote").value;

        if(amount == ""){
            swal({
                title: "Error",
                text: "Please enter an amount",
                icon: "error",
                button: "OK",
            });
        }else if(type == "0"){
            swal({
                title: "Error",
                text: "Please select a type",
                icon: "error",
                button: "OK",
            });
        }
        else if(category == "0"){
            swal({
                title: "Error",
                text: "Please select a category",
                icon: "error",
                button: "OK",
            });
        }
        else if(formattedDate == "NaN/NaN/NaN"){
            swal({
                title: "Error",
                text: "Please select a date",
                icon: "error",
                button: "OK",
            });
        }else{
            doContinue = true;
        }

        if(doContinue){
            const transactionData = {
                id: currentTransactionId,
                amount: amount,
                type: type,
                category: category,
                date: formattedDate,
                note: note
            }
            console.log(transactionData);

            try{
                const result = await window.api.editTransaction(transactionData);
                console.log(result);
                swal({
                    title: "Success",
                    text: "Transaction added successfully",
                    icon: "success",
                    button: "OK",
                }).then(() => {
                    addTransaction.hide();
                    window.location.reload();
                });
            }catch (error){
                console.error("Error adding transaction:", error);
            }
        }
    }


    function convertToISOFormat(date){
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
        const day = date.getDate().toString().padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

});



function goBack(){
  window.location.href = "index.html";
}
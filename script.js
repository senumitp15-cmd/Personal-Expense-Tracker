document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const form = document.getElementById("transaction-form");
    const clearFormBtn = document.getElementById("clear-form-btn");
    const typeInput = document.getElementById("type");
    const descriptionInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");
    const dateInput = document.getElementById("date");
    
    const filterType = document.getElementById("filter-type");
    const searchInput = document.getElementById("search-input");
    const transactionList = document.getElementById("transaction-list");
    
    const totalIncomeEl = document.getElementById("total-income");
    const totalExpenseEl = document.getElementById("total-expense");
    const currentBalanceEl = document.getElementById("current-balance");

    // Initialize date to today's date
    dateInput.value = new Date().toISOString().split("T")[0];

    // Restore stored transactions from localStorage
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Save state & Update UI
    function updateApp() {
        localStorage.setItem("transactions", JSON.stringify(transactions));
        calculateTotals();
        renderTable();
    }

    // Number/Currency Formatter
    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Calculate Totals for Summary Cards
    function calculateTotals() {
        const incomeSum = transactions
            .filter(t => t.type === "Income")
            .reduce((sum, t) => sum + t.amount, 0);

        const expenseSum = transactions
            .filter(t => t.type === "Expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = incomeSum - expenseSum;

        totalIncomeEl.textContent = `LKR ${formatCurrency(incomeSum)}`;
        totalExpenseEl.textContent = `LKR ${formatCurrency(expenseSum)}`;
        currentBalanceEl.textContent = `LKR ${formatCurrency(balance)}`;
    }

    // Handle Adding New Transaction
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const type = typeInput.value;
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;

        // Validation Check
        if (!type || !description || isNaN(amount) || amount <= 0 || !category || !date) {
            alert("Please complete all required fields and ensure amount is greater than zero.");
            return;
        }

        const newTransaction = {
            id: Date.now(),
            type,
            description,
            amount,
            category,
            date
        };

        transactions.push(newTransaction);

        // Reset filter & search inputs so the newly added item shows up immediately in the table
        filterType.value = "All";
        searchInput.value = "";

        updateApp();
        resetForm();

        alert("Transaction added successfully!");
    });

    // Reset Form Input Fields
    function resetForm() {
        form.reset();
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    clearFormBtn.addEventListener("click", resetForm);

    // Global Delete Function linked to button click in HTML table
    window.deleteTransaction = function(id) {
        transactions = transactions.filter(t => t.id !== id);
        updateApp();
    };

    // Render Transaction Table Row Log
    function renderTable() {
        const filterVal = filterType.value;
        const searchVal = searchInput.value.toLowerCase().trim();

        const filtered = transactions.filter(t => {
            const matchesType = filterVal === "All" || t.type === filterVal;
            const matchesSearch = t.description.toLowerCase().includes(searchVal) || 
                                  t.category.toLowerCase().includes(searchVal);
            return matchesType && matchesSearch;
        });

        if (filtered.length === 0) {
            transactionList.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">No transactions found</td>
                </tr>
            `;
            return;
        }

        transactionList.innerHTML = filtered.map(t => {
            const isIncome = t.type === "Income";
            const amountPrefix = isIncome ? "+ LKR " : "- LKR ";
            const amountClass = isIncome ? "amount-income" : "amount-expense";
            const badgeClass = isIncome ? "badge-income" : "badge-expense";

            return `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td><span class="badge ${badgeClass}">${t.type}</span></td>
                    <td>${t.category}</td>
                    <td class="${amountClass}">${amountPrefix}${formatCurrency(t.amount)}</td>
                    <td>
                        <button class="btn btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Filter & Search Event Listeners
    filterType.addEventListener("change", renderTable);
    searchInput.addEventListener("input", renderTable);

    // Render initial state on load
    updateApp();
});
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load transactions from localStorage
    loadTransactions();
    
    // Set today's date as default in the form
    document.getElementById('date').valueAsDate = new Date();
    
    // Add event listeners
    document.getElementById('transaction-form').addEventListener('submit', addTransaction);
    document.getElementById('filter-month').addEventListener('change', filterTransactions);
    document.getElementById('filter-type').addEventListener('change', filterTransactions);
    document.getElementById('filter-category').addEventListener('change', filterTransactions);
});

// Global variables
let transactions = [];

// Load transactions from localStorage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        updateDashboard();
        renderTransactions();
    }
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Add a new transaction
function addTransaction(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    
    const transaction = {
        id: Date.now(),
        description,
        amount,
        date,
        type,
        category
    };
    
    transactions.push(transaction);
    saveTransactions();
    updateDashboard();
    renderTransactions();
    
    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('date').valueAsDate = new Date();
}

// Update dashboard with totals
function updateDashboard() {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });
    
    const totalBalance = totalIncome - totalExpenses;
    
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
    
    // Change color of balance based on value
    const balanceElement = document.getElementById('total-balance');
    if (totalBalance > 0) {
        balanceElement.style.color = 'var(--success-color)';
    } else if (totalBalance < 0) {
        balanceElement.style.color = 'var(--accent-color)';
    } else {
        balanceElement.style.color = 'var(--primary-color)';
    }
}

// Render transactions in the list
function renderTransactions(filteredTransactions = null) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    
    const transactionsToRender = filteredTransactions || transactions;
    
    if (transactionsToRender.length === 0) {
        transactionList.innerHTML = '<p class="empty-state">Nenhuma transação encontrada.</p>';
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactionsToRender].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.classList.add('transaction-item');
        
        const formattedDate = formatDate(transaction.date);
        const categoryLabel = getCategoryLabel(transaction.category);
        
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-description">${transaction.description}</span>
                <div class="transaction-details">
                    <span>${formattedDate}</span>
                    <span>${categoryLabel}</span>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="btn-edit" data-id="${transaction.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" data-id="${transaction.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        transactionList.appendChild(transactionItem);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', editTransaction);
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', deleteTransaction);
    });
}

// Filter transactions
function filterTransactions() {
    const monthFilter = document.getElementById('filter-month').value;
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    
    let filteredTransactions = [...transactions];
    
    // Filter by month
    if (monthFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() + 1 === parseInt(monthFilter);
        });
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => {
            return transaction.type === typeFilter;
        });
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(transaction => {
            return transaction.category === categoryFilter;
        });
    }
    
    renderTransactions(filteredTransactions);
}

// Edit transaction
function editTransaction(e) {
    const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
        // Fill the form with transaction data
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('date').value = transaction.date;
        document.getElementById('type').value = transaction.type;
        document.getElementById('category').value = transaction.category;
        
        // Remove the transaction
        deleteTransactionById(transactionId);
        
        // Scroll to form
        document.querySelector('.transaction-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete transaction
function deleteTransaction(e) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        const transactionId = parseInt(e.currentTarget.getAttribute('data-id'));
        deleteTransactionById(transactionId);
    }
}

// Delete transaction by ID
function deleteTransactionById(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    saveTransactions();
    updateDashboard();
    renderTransactions();
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

// Get category label
function getCategoryLabel(category) {
    const categories = {
        'salary': 'Salário',
        'investment': 'Investimentos',
        'food': 'Alimentação',
        'transport': 'Transporte',
        'housing': 'Moradia',
        'entertainment': 'Lazer',
        'health': 'Saúde',
        'education': 'Educação',
        'other': 'Outros'
    };
    
    return categories[category] || category;
}
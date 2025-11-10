// Sample stock data (Indian stocks with prices in Rupees)
const defaultStocks = [
    { symbol: 'TCS', price: 3850, expectedReturn: 12 },
    { symbol: 'INFY', price: 1520, expectedReturn: 15 },
    { symbol: 'RELIANCE', price: 2450, expectedReturn: 18 },
    { symbol: 'HDFC', price: 1680, expectedReturn: 14 },
    { symbol: 'WIPRO', price: 445, expectedReturn: 20 }
];

let stocks = [...defaultStocks];

// Initialize the app
function init() {
    renderStocks();

    document.getElementById('addStock').addEventListener('click', addStock);
    document.getElementById('optimize').addEventListener('click', optimizePortfolio);
    document.getElementById('resetStocks').addEventListener('click', resetStocks);

    // Add input validation feedback
    document.getElementById('budget').addEventListener('input', validateBudget);

    showToast('Welcome! Configure your portfolio and click Optimize 🚀', 'info');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Validate budget input
function validateBudget(e) {
    const value = parseFloat(e.target.value);
    if (value < 0) {
        e.target.value = 0;
    }
}

// Reset stocks to default
function resetStocks() {
    stocks = [...defaultStocks];
    renderStocks();
    showToast('Stocks reset to default values', 'info');
}

// Render stocks table
function renderStocks() {
    const tbody = document.getElementById('stocksBody');
    tbody.innerHTML = '';

    stocks.forEach((stock, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${stock.symbol}" data-index="${index}" data-field="symbol" placeholder="Symbol"></td>
            <td><input type="number" value="${stock.price}" data-index="${index}" data-field="price" min="0" step="0.01" placeholder="Price"></td>
            <td><input type="number" value="${stock.expectedReturn}" data-index="${index}" data-field="expectedReturn" min="0" step="0.1" placeholder="Return %"></td>
            <td><button class="btn-remove" data-index="${index}">✕</button></td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners
    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', updateStock);
        input.addEventListener('focus', (e) => e.target.parentElement.parentElement.classList.add('editing'));
        input.addEventListener('blur', (e) => e.target.parentElement.parentElement.classList.remove('editing'));
    });

    tbody.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', removeStock);
    });
}

// Update stock data
function updateStock(e) {
    const index = parseInt(e.target.dataset.index);
    const field = e.target.dataset.field;
    const value = field === 'symbol' ? e.target.value : parseFloat(e.target.value);

    stocks[index][field] = value;
}

// Add new stock
function addStock() {
    stocks.push({ symbol: 'NEW', price: 1000, expectedReturn: 10 });
    renderStocks();
    showToast('New stock added! Edit the details', 'success');

    // Focus on the new stock's symbol input
    setTimeout(() => {
        const inputs = document.querySelectorAll('#stocksBody input[data-field="symbol"]');
        inputs[inputs.length - 1].focus();
        inputs[inputs.length - 1].select();
    }, 100);
}

// Remove stock
function removeStock(e) {
    const index = parseInt(e.target.dataset.index);
    const stockName = stocks[index].symbol;
    stocks.splice(index, 1);
    renderStocks();
    showToast(`${stockName} removed from portfolio`, 'info');
}

// Optimize portfolio using Knapsack algorithm
function optimizePortfolio() {
    const budget = parseFloat(document.getElementById('budget').value);

    if (!budget || budget <= 0) {
        showToast('Please enter a valid budget amount', 'error');
        document.getElementById('budget').focus();
        return;
    }

    if (stocks.length === 0) {
        showToast('Please add at least one stock to optimize', 'error');
        return;
    }

    // Show loading state
    const btn = document.getElementById('optimize');
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loader').style.display = 'inline';
    btn.disabled = true;

    // Simulate processing time for better UX
    setTimeout(() => {
        // Run optimization
        const optimizer = new KnapsackOptimizer(budget, stocks);
        const result = optimizer.optimize();

        // Display results
        displayResults(result, budget);

        // Reset button state
        btn.querySelector('.btn-text').style.display = 'inline';
        btn.querySelector('.btn-loader').style.display = 'none';
        btn.disabled = false;

        showToast('Portfolio optimized successfully! 🎉', 'success');
    }, 800);
}

// Display optimization results
function displayResults(result, budget) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';

    // Animate numbers
    animateValue('totalInvestment', 0, result.totalInvestment, 1000, '₹');
    animateValue('expectedReturn', 0, result.totalReturn, 1000, '', '%');
    animateValue('remainingBudget', 0, result.remainingBudget, 1000, '₹');

    // Update progress bar
    const progressPercent = (result.totalInvestment / budget) * 100;
    document.getElementById('investmentProgress').style.width = `${progressPercent}%`;

    // Display selected stocks
    const selectedList = document.getElementById('selectedStocksList');
    selectedList.innerHTML = '';

    if (result.selectedStocks.length === 0) {
        selectedList.innerHTML = '<div class="empty-state"><p>💡 No stocks selected. Try increasing your budget or adjusting stock prices.</p></div>';
    } else {
        result.selectedStocks.forEach((stock, index) => {
            const card = document.createElement('div');
            card.className = 'stock-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="stock-info">
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-details">Price: ₹${stock.price.toFixed(2)}</div>
                </div>
                <div class="stock-return">+${stock.expectedReturn}%</div>
            `;
            selectedList.appendChild(card);
        });
    }

    // Draw chart
    drawChart(result, budget);

    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Animate number counting
function animateValue(id, start, end, duration, prefix = '', suffix = '') {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = `${prefix}${current.toFixed(2)}${suffix}`;
    }, 16);
}

// Draw portfolio visualization
function drawChart(result, budget) {
    const canvas = document.getElementById('portfolioChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (result.selectedStocks.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', width / 2, height / 2);
        return;
    }

    // Draw bar chart with animations
    const barWidth = width / result.selectedStocks.length;
    const maxReturn = Math.max(...result.selectedStocks.map(s => s.expectedReturn));
    const padding = 20;

    result.selectedStocks.forEach((stock, index) => {
        const barHeight = (stock.expectedReturn / maxReturn) * (height - 80);
        const x = index * barWidth;
        const y = height - barHeight - 50;
        const actualBarWidth = barWidth - padding;

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(x + padding / 2 + 2, y + 2, actualBarWidth, barHeight);

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(0, y, 0, height - 50);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + padding / 2, y, actualBarWidth, barHeight, [8, 8, 0, 0]);
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stock.symbol, x + barWidth / 2, height - 25);

        // Draw value on top of bar
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${stock.expectedReturn}%`, x + barWidth / 2, y + 25);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

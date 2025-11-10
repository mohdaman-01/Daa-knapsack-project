// Sample stock data
const defaultStocks = [
    { symbol: 'AAPL', price: 175, expectedReturn: 12 },
    { symbol: 'GOOGL', price: 140, expectedReturn: 15 },
    { symbol: 'MSFT', price: 380, expectedReturn: 18 },
    { symbol: 'AMZN', price: 145, expectedReturn: 14 },
    { symbol: 'TSLA', price: 240, expectedReturn: 20 }
];

let stocks = [...defaultStocks];

// Initialize the app
function init() {
    renderStocks();
    
    document.getElementById('addStock').addEventListener('click', addStock);
    document.getElementById('optimize').addEventListener('click', optimizePortfolio);
}

// Render stocks table
function renderStocks() {
    const tbody = document.getElementById('stocksBody');
    tbody.innerHTML = '';
    
    stocks.forEach((stock, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${stock.symbol}" data-index="${index}" data-field="symbol"></td>
            <td><input type="number" value="${stock.price}" data-index="${index}" data-field="price" min="0" step="0.01"></td>
            <td><input type="number" value="${stock.expectedReturn}" data-index="${index}" data-field="expectedReturn" min="0" step="0.1"></td>
            <td><button class="btn-remove" data-index="${index}">Remove</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners
    tbody.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', updateStock);
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
    stocks.push({ symbol: 'NEW', price: 100, expectedReturn: 10 });
    renderStocks();
}

// Remove stock
function removeStock(e) {
    const index = parseInt(e.target.dataset.index);
    stocks.splice(index, 1);
    renderStocks();
}

// Optimize portfolio using Knapsack algorithm
function optimizePortfolio() {
    const budget = parseFloat(document.getElementById('budget').value);
    
    if (!budget || budget <= 0) {
        alert('Please enter a valid budget');
        return;
    }
    
    if (stocks.length === 0) {
        alert('Please add at least one stock');
        return;
    }
    
    // Run optimization
    const optimizer = new KnapsackOptimizer(budget, stocks);
    const result = optimizer.optimize();
    
    // Display results
    displayResults(result, budget);
}

// Display optimization results
function displayResults(result, budget) {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    
    // Update summary
    document.getElementById('totalInvestment').textContent = 
        `$${result.totalInvestment.toFixed(2)}`;
    document.getElementById('expectedReturn').textContent = 
        `${result.totalReturn.toFixed(2)}%`;
    document.getElementById('remainingBudget').textContent = 
        `$${result.remainingBudget.toFixed(2)}`;
    
    // Display selected stocks
    const selectedList = document.getElementById('selectedStocksList');
    selectedList.innerHTML = '';
    
    if (result.selectedStocks.length === 0) {
        selectedList.innerHTML = '<p>No stocks selected. Try increasing your budget.</p>';
    } else {
        result.selectedStocks.forEach(stock => {
            const card = document.createElement('div');
            card.className = 'stock-card';
            card.innerHTML = `
                <div class="stock-info">
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div class="stock-details">Price: $${stock.price.toFixed(2)}</div>
                </div>
                <div class="stock-return">+${stock.expectedReturn}%</div>
            `;
            selectedList.appendChild(card);
        });
    }
    
    // Draw chart
    drawChart(result, budget);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
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
    
    // Draw bar chart
    const barWidth = width / result.selectedStocks.length;
    const maxReturn = Math.max(...result.selectedStocks.map(s => s.expectedReturn));
    
    result.selectedStocks.forEach((stock, index) => {
        const barHeight = (stock.expectedReturn / maxReturn) * (height - 60);
        const x = index * barWidth;
        const y = height - barHeight - 40;
        
        // Draw bar
        const gradient = ctx.createLinearGradient(0, y, 0, height - 40);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 10, y, barWidth - 20, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stock.symbol, x + barWidth / 2, height - 20);
        
        // Draw value
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${stock.expectedReturn}%`, x + barWidth / 2, y - 5);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

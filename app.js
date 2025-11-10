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

    // Calculate actual expected return in rupees
    const expectedReturnAmount = result.selectedStocks.reduce((sum, stock) => {
        return sum + (stock.totalCost * stock.expectedReturn / 100);
    }, 0);

    // Animate numbers
    animateValue('totalInvestment', 0, result.totalInvestment, 1000, '₹');
    animateValue('expectedReturn', 0, expectedReturnAmount, 1000, '₹');
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
            const returnAmount = (stock.totalCost * stock.expectedReturn / 100).toFixed(2);
            card.innerHTML = `
                <div class="stock-info">
                    <div class="stock-symbol">${stock.symbol} <span class="quantity-badge">×${stock.quantity}</span></div>
                    <div class="stock-details">
                        <span>₹${stock.price.toFixed(2)} per share</span>
                        <span class="total-cost">Investment: ₹${stock.totalCost.toFixed(2)}</span>
                    </div>
                </div>
                <div class="stock-return">
                    <div class="return-percent">${stock.expectedReturn}%</div>
                    <div class="return-total">+₹${returnAmount}</div>
                </div>
            `;
            selectedList.appendChild(card);
        });
    }

    // Draw charts
    drawChart(result, budget);
    drawPieChart(result);

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

// Draw portfolio visualization with enhanced aesthetics
function drawChart(result, budget) {
    const canvas = document.getElementById('portfolioChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (result.selectedStocks.length === 0) {
        // Enhanced empty state
        ctx.fillStyle = '#cbd5e0';
        ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('📊 No data to display', width / 2, height / 2);
        return;
    }

    // Draw grid lines for better readability
    drawGrid(ctx, width, height);

    // Calculate dimensions
    const chartPadding = { top: 40, right: 30, bottom: 80, left: 50 };
    const chartWidth = width - chartPadding.left - chartPadding.right;
    const chartHeight = height - chartPadding.top - chartPadding.bottom;
    const barWidth = chartWidth / result.selectedStocks.length;
    const maxReturn = Math.max(...result.selectedStocks.map(s => s.expectedReturn));
    const padding = Math.min(barWidth * 0.2, 20);

    // Color palette for bars
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140']
    ];

    result.selectedStocks.forEach((stock, index) => {
        const barHeight = (stock.expectedReturn / maxReturn) * chartHeight;
        const x = chartPadding.left + (index * barWidth);
        const y = chartPadding.top + (chartHeight - barHeight);
        const actualBarWidth = barWidth - padding;

        // Select color for this bar
        const colorPair = colors[index % colors.length];

        // Draw 3D shadow effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x + padding / 2 + 4, y + 4, actualBarWidth, barHeight, [12, 12, 4, 4]);
        ctx.fill();

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, colorPair[0]);
        gradient.addColorStop(1, colorPair[1]);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + padding / 2, y, actualBarWidth, barHeight, [12, 12, 4, 4]);
        ctx.fill();

        // Add glossy effect on top
        const glossGradient = ctx.createLinearGradient(x, y, x, y + barHeight * 0.3);
        glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGradient;
        ctx.beginPath();
        ctx.roundRect(x + padding / 2, y, actualBarWidth, barHeight * 0.3, [12, 12, 0, 0]);
        ctx.fill();

        // Draw stock symbol below bar
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.fillText(stock.symbol, x + barWidth / 2, height - chartPadding.bottom + 25);

        // Draw price below symbol
        ctx.fillStyle = '#718096';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.fillText(`₹${stock.price.toFixed(0)}`, x + barWidth / 2, height - chartPadding.bottom + 42);

        // Draw percentage value on bar with background
        const percentText = `${stock.expectedReturn}%`;
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        const textMetrics = ctx.measureText(percentText);
        const textWidth = textMetrics.width;
        const textHeight = 20;
        const textX = x + barWidth / 2;
        const textY = barHeight > 60 ? y + 30 : y - 15;

        // Draw background for text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(textX - textWidth / 2 - 8, textY - textHeight / 2 - 4, textWidth + 16, textHeight + 8, 8);
        ctx.fill();

        // Draw text
        ctx.fillStyle = colorPair[1];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(percentText, textX, textY);
    });

    // Draw Y-axis labels
    drawYAxisLabels(ctx, chartPadding, chartHeight, maxReturn);

    // Draw title
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'left';
    ctx.fillText('Expected Returns (%)', chartPadding.left, 25);
}

// Draw grid lines
function drawGrid(ctx, width, height) {
    const chartPadding = { top: 40, right: 30, bottom: 80, left: 50 };
    const chartHeight = height - chartPadding.top - chartPadding.bottom;
    const gridLines = 5;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i <= gridLines; i++) {
        const y = chartPadding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(chartPadding.left, y);
        ctx.lineTo(width - chartPadding.right, y);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

// Draw Y-axis labels
function drawYAxisLabels(ctx, chartPadding, chartHeight, maxReturn) {
    const gridLines = 5;
    ctx.fillStyle = '#718096';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
        const value = (maxReturn / gridLines) * (gridLines - i);
        const y = chartPadding.top + (chartHeight / gridLines) * i;
        ctx.fillText(`${value.toFixed(1)}%`, chartPadding.left - 10, y);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);


// Draw pie chart for investment distribution
function drawPieChart(result) {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 350 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '350px';
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 350;

    ctx.clearRect(0, 0, width, height);

    if (result.selectedStocks.length === 0) {
        ctx.fillStyle = '#cbd5e0';
        ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('📊 No data to display', width / 2, height / 2);
        return;
    }

    // Calculate total investment
    const total = result.selectedStocks.reduce((sum, stock) => sum + stock.totalCost, 0);

    // Color palette
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140']
    ];

    // Center and radius - bigger chart with minimal padding
    const padding = 40; // Minimal space for edge
    const centerX = width / 2;
    const centerY = height / 2;
    const availableSize = Math.min(width - padding * 2, height - padding * 2);
    const radius = availableSize / 2;
    const innerRadius = radius * 0.6; // Donut chart

    let currentAngle = -Math.PI / 2;

    // Draw pie slices
    result.selectedStocks.forEach((stock, index) => {
        const sliceAngle = (stock.totalCost / total) * 2 * Math.PI;
        const colorPair = colors[index % colors.length];

        // Create gradient for slice
        const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
        gradient.addColorStop(0, colorPair[0]);
        gradient.addColorStop(1, colorPair[1]);

        // Draw outer shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();

        // Draw white border between slices
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw percentage directly on the slice
        const percentage = ((stock.totalCost / total) * 100).toFixed(1);
        const midAngle = currentAngle + sliceAngle / 2;
        const textRadius = (radius + innerRadius) / 2;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;

        // Draw percentage on slice
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(`${percentage}%`, textX, textY);
        ctx.shadowBlur = 0;

        currentAngle += sliceAngle;
    });

    // Draw center circle (donut hole) with gradient
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
    centerGradient.addColorStop(0, '#ffffff');
    centerGradient.addColorStop(1, '#f7fafc');

    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw center text
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total', centerX, centerY - 12);

    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillText(`₹${total.toFixed(0)}`, centerX, centerY + 12);

    // Draw legend below the chart
    drawPieLegend(result, colors, total);
}

// Draw legend for pie chart
function drawPieLegend(result, colors, total) {
    const legendContainer = document.getElementById('pieLegend');
    legendContainer.innerHTML = '';

    result.selectedStocks.forEach((stock, index) => {
        const colorPair = colors[index % colors.length];
        const percentage = ((stock.totalCost / total) * 100).toFixed(1);

        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})"></div>
            <span class="legend-label">${stock.symbol} ×${stock.quantity}</span>
            <span class="legend-value">₹${stock.totalCost.toFixed(0)} (${percentage}%)</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

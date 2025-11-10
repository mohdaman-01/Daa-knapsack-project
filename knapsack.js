// Knapsack Algorithm Implementation for Stock Investment Optimization
class KnapsackOptimizer {
    constructor(budget, stocks) {
        this.budget = Math.floor(budget);
        this.stocks = stocks;
    }

    // Unbounded Knapsack using Dynamic Programming (allows multiple shares)
    optimize() {
        const n = this.stocks.length;
        const W = this.budget;
        
        // Create DP table and parent tracking
        const dp = Array(W + 1).fill(0);
        const parent = Array(W + 1).fill(-1);
        
        // Build table - unbounded knapsack allows multiple items
        for (let w = 1; w <= W; w++) {
            for (let i = 0; i < n; i++) {
                const stock = this.stocks[i];
                const price = Math.floor(stock.price);
                const value = stock.expectedReturn;
                
                if (price <= w && dp[w - price] + value > dp[w]) {
                    dp[w] = dp[w - price] + value;
                    parent[w] = i;
                }
            }
        }
        
        // Backtrack to find selected stocks with quantities
        const stockQuantities = new Map();
        let w = W;
        
        while (w > 0 && parent[w] !== -1) {
            const stockIndex = parent[w];
            const stock = this.stocks[stockIndex];
            const price = Math.floor(stock.price);
            
            // Count quantity
            const key = stock.symbol;
            stockQuantities.set(key, (stockQuantities.get(key) || 0) + 1);
            
            w -= price;
        }
        
        // Build result with quantities
        const selectedStocks = [];
        let totalInvestment = 0;
        let totalReturn = 0;
        
        for (const [symbol, quantity] of stockQuantities) {
            const stock = this.stocks.find(s => s.symbol === symbol);
            const investment = stock.price * quantity;
            const expectedReturn = stock.expectedReturn * quantity;
            
            selectedStocks.push({
                symbol: stock.symbol,
                price: stock.price,
                quantity: quantity,
                totalCost: investment,
                expectedReturn: stock.expectedReturn,
                totalReturn: expectedReturn
            });
            
            totalInvestment += investment;
            totalReturn += expectedReturn;
        }
        
        const remainingBudget = this.budget - totalInvestment;
        
        return {
            selectedStocks: selectedStocks.sort((a, b) => b.totalReturn - a.totalReturn),
            totalInvestment,
            totalReturn,
            remainingBudget,
            maxValue: dp[W]
        };
    }
}

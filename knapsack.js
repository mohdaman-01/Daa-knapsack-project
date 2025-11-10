// Knapsack Algorithm Implementation for Stock Investment Optimization
class KnapsackOptimizer {
    constructor(budget, stocks) {
        this.budget = Math.floor(budget);
        this.stocks = stocks;
    }

    // 0/1 Knapsack using Dynamic Programming
    optimize() {
        const n = this.stocks.length;
        const W = this.budget;
        
        // Create DP table
        const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));
        
        // Build table in bottom-up manner
        for (let i = 1; i <= n; i++) {
            const stock = this.stocks[i - 1];
            const price = Math.floor(stock.price);
            const value = stock.expectedReturn;
            
            for (let w = 0; w <= W; w++) {
                if (price <= w) {
                    dp[i][w] = Math.max(
                        dp[i - 1][w],
                        dp[i - 1][w - price] + value
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        
        // Backtrack to find selected stocks
        const selectedStocks = [];
        let w = W;
        
        for (let i = n; i > 0 && w > 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                const stock = this.stocks[i - 1];
                selectedStocks.push(stock);
                w -= Math.floor(stock.price);
            }
        }
        
        // Calculate totals
        const totalInvestment = selectedStocks.reduce((sum, stock) => sum + stock.price, 0);
        const totalReturn = selectedStocks.reduce((sum, stock) => sum + stock.expectedReturn, 0);
        const remainingBudget = this.budget - totalInvestment;
        
        return {
            selectedStocks: selectedStocks.reverse(),
            totalInvestment,
            totalReturn,
            remainingBudget,
            maxValue: dp[n][W]
        };
    }
}

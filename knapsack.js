// Knapsack Algorithm Implementation for Stock Investment Optimization
class KnapsackOptimizer {
    constructor(budget, stocks) {
        this.budget = budget;
        this.stocks = stocks;
    }

    // Diversified Portfolio Optimization using Modified Knapsack
    optimize() {
        if (this.stocks.length === 0) {
            return {
                selectedStocks: [],
                totalInvestment: 0,
                totalReturn: 0,
                remainingBudget: this.budget,
                maxValue: 0
            };
        }

        // Sort stocks by return/price ratio (efficiency)
        const sortedStocks = [...this.stocks].sort((a, b) => {
            return (b.expectedReturn / b.price) - (a.expectedReturn / a.price);
        });

        let remainingBudget = this.budget;
        const portfolio = new Map();

        // Strategy: Diversify across all profitable stocks
        // First pass: Buy at least one share of each stock if possible
        for (const stock of sortedStocks) {
            if (remainingBudget >= stock.price) {
                portfolio.set(stock.symbol, {
                    stock: stock,
                    quantity: 1
                });
                remainingBudget -= stock.price;
            }
        }

        // Second pass: Distribute remaining budget proportionally based on returns
        // Calculate total return rate for normalization
        const totalReturnRate = sortedStocks.reduce((sum, s) => sum + s.expectedReturn, 0);
        
        // Allocate remaining budget proportionally
        for (const stock of sortedStocks) {
            if (remainingBudget < stock.price) continue;
            
            // Calculate how much budget this stock should get based on its return
            const proportion = stock.expectedReturn / totalReturnRate;
            const targetAllocation = this.budget * proportion;
            
            // Calculate current allocation
            const currentAllocation = portfolio.has(stock.symbol) 
                ? portfolio.get(stock.symbol).quantity * stock.price 
                : 0;
            
            // Buy more shares to reach target (or as close as possible)
            const additionalBudget = Math.min(targetAllocation - currentAllocation, remainingBudget);
            const additionalShares = Math.floor(additionalBudget / stock.price);
            
            if (additionalShares > 0) {
                const current = portfolio.get(stock.symbol);
                current.quantity += additionalShares;
                remainingBudget -= additionalShares * stock.price;
            }
        }

        // Third pass: Use any remaining budget on the best performing stocks
        let improved = true;
        while (improved && remainingBudget > 0) {
            improved = false;
            for (const stock of sortedStocks) {
                if (remainingBudget >= stock.price) {
                    const current = portfolio.get(stock.symbol);
                    current.quantity += 1;
                    remainingBudget -= stock.price;
                    improved = true;
                    break;
                }
            }
        }

        // Build result
        const selectedStocks = [];
        let totalInvestment = 0;
        let totalReturn = 0;

        for (const [symbol, data] of portfolio) {
            const { stock, quantity } = data;
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

        return {
            selectedStocks: selectedStocks.sort((a, b) => b.totalReturn - a.totalReturn),
            totalInvestment,
            totalReturn,
            remainingBudget,
            maxValue: totalReturn
        };
    }
}

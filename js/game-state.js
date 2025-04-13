/**
 * Game State Management
 * Handles the core game state and calculations
 */

// Game state object
const game = {
    // Resources
    products: 0,
    money: 0,
    price: 5.00, // Changed base price to $5.00
    demand: 100,
    
    // Production
    autoProducers: 0,
    autoRate: 0,
    lastAutoSell: Date.now(), // Add tracking for last auto-sell time
    
    // Upgrades
    hasAutoSell: false,
    
    // Last update time
    lastUpdate: Date.now()
};

/**
 * Calculate the current sale price based on market demand
 */
function calculateSalePrice() {
    const demandFactor = game.demand / 100;
    return game.price * demandFactor;
}

/**
 * Calculate market demand based on price
 */
function calculateDemand() {
    const basePrice = 5.00; // Base price for 100% demand
    const priceFactor = basePrice / game.price;
    
    // Exponential relationship between price and demand
    return Math.min(200, Math.max(20, 100 * priceFactor));
}

/**
 * Adjust price and update demand
 */
function adjustPrice(amount) {
    const minPrice = 1.00;
    const maxPrice = 20.00;
    
    // Update price within bounds
    game.price = Math.min(maxPrice, Math.max(minPrice, game.price + amount));
    
    // Immediately update demand based on new price
    game.demand = calculateDemand();
    
    console.log(`Price adjusted to $${game.price.toFixed(2)}, new demand: ${game.demand.toFixed(1)}%`);
}

/**
 * Sell products
 */
function sellProducts(amount) {
    amount = Math.min(game.products, Math.floor(amount));
    
    if (amount > 0) {
        const salePrice = calculateSalePrice();
        const totalSale = salePrice * amount;
        
        console.log(`Selling ${amount} products at $${salePrice} each for $${totalSale} total`); // Debug log
        
        game.products -= amount;
        game.money += totalSale;
        
        // Adjust demand
        game.demand = Math.max(50, game.demand - (amount * 0.1));
        return true;
    }
    return false;
}

/**
 * Auto-sell products
 */
function performAutoSell(currentTime) {
    if (!game.hasAutoSell || game.products <= 0) return;
    
    // Base auto-sell interval is 2 seconds
    const baseInterval = 2000;
    
    // Adjust interval based on demand:
    // - At 200% demand: sells every 1 second
    // - At 100% demand: sells every 2 seconds
    // - At 20% demand: sells every 10 seconds
    const demandFactor = game.demand / 100;
    const adjustedInterval = baseInterval / demandFactor;
    
    if (currentTime - game.lastAutoSell >= adjustedInterval) {
        // Sell 1 product if we have it
        if (game.products >= 1) {
            const salePrice = game.price; // Use actual price, not demand-adjusted
            
            console.log(`Auto-selling 1 product at $${salePrice.toFixed(2)} (Demand: ${game.demand.toFixed(1)}%)`);
            
            game.products -= 1;
            game.money += salePrice;
        }
        
        // Update last auto-sell time
        game.lastAutoSell = currentTime;
    }
}

/**
 * Update game state on each tick
 */
function updateGameState() {
    const now = Date.now();
    const delta = (now - game.lastUpdate) / 1000;
    game.lastUpdate = now;
    
    // Auto production - always add to inventory
    if (game.autoRate > 0) {
        const newProducts = game.autoRate * delta;
        game.products += newProducts;
    }
    
    // Auto-sell check - separate from production
    if (game.hasAutoSell) {
        performAutoSell(now);
    }
    
    // Update UI
    updateUI();
}

/**
 * Calculate the auto production rate
 */
function calculateAutoRate() {
    game.autoRate = game.autoProducers; // 1 product per second per producer
    console.log('Auto rate updated:', game.autoRate); // Debug log
}

// Start game loop
setInterval(updateGameState, 100); // Update every 100ms
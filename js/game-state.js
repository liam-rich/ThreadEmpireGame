/**
 * Game State Management
 * Handles the core game state and calculations
 */

// Game state object
const game = {
    // Resources
    products: 0,
    money: 0,
    price: 9.99,
    demand: 100, // Percentage of market demand
    
    // Production
    autoProducers: 0,
    autoRate: 0,
    
    // Upgrades
    efficiencyLevel: 0,
    marketingLevel: 0,
    factoryCount: 0,
    marketCount: 1,
    productLines: 1,
    hasAutoSell: true, // Auto-sell enabled by default
    
    // Research progress
    researchProgress: {
        marketTrends: 0,
        qualityMaterials: 0,
        automation: 0
    },
    
    // Research completion status
    researchComplete: {
        marketTrends: false,
        qualityMaterials: false,
        automation: false
    },
    
    // Game progression
    productTier: 1, // 1: Socks, 2: T-shirts, 3: Jeans, 4: Suits
    playerLevel: "Startup", // Player's business level
    
    // Timing
    lastUpdate: Date.now(),
    
    // Feature unlocks
    unlocks: {
        autoSell: true, // Auto-sell unlocked by default
        efficiency: false,
        marketing: false,
        qualityMaterials: false,
        automation: false,
        factory: false,
        expansion: false,
        diversification: false
    }
};

// Product tiers information
const productTiers = [
    {
        name: "Socks",
        basePrice: 9.99,
        makeBtnText: "MAKE SOCKS",
        playerLevel: "Startup",
        svgPath: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,20 C30,20 35,40 35,60 C35,80 25,85 25,85 L65,85 C65,85 55,80 55,60 C55,40 60,20 60,20 Z" 
                  fill="#3498db" stroke="#2c3e50" stroke-width="2"/>
            <path d="M30,20 L60,20 L60,30 L30,30 Z" fill="#2c3e50" stroke="#2c3e50"/>
        </svg>`
    },
    {
        name: "T-Shirts",
        basePrice: 24.99,
        makeBtnText: "MAKE T-SHIRTS",
        playerLevel: "Boutique",
        svgPath: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,20 L40,10 L60,10 L80,20 L70,40 L60,35 L60,85 L40,85 L40,35 L30,40 Z" 
                  fill="#e74c3c" stroke="#2c3e50" stroke-width="2"/>
        </svg>`
    },
    {
        name: "Jeans",
        basePrice: 49.99,
        makeBtnText: "MAKE JEANS",
        playerLevel: "Brand",
        svgPath: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,10 L70,10 L75,30 L65,90 L55,90 L50,50 L45,90 L35,90 L25,30 Z" 
                  fill="#3498db" stroke="#2c3e50" stroke-width="2"/>
            <path d="M30,10 L70,10 L70,20 L30,20 Z" fill="#2c3e50"/>
            <circle cx="50" cy="25" r="3" fill="#e67e22"/>
        </svg>`
    },
    {
        name: "Suits",
        basePrice: 299.99,
        makeBtnText: "MAKE SUITS",
        playerLevel: "Fashion Empire",
        svgPath: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,10 L45,15 L50,10 L55,15 L75,10 L70,90 L55,85 L50,90 L45,85 L30,90 Z" 
                  fill="#2c3e50" stroke="#2c3e50" stroke-width="1"/>
            <path d="M45,15 L50,10 L55,15 L55,60 L45,60 Z" fill="#ecf0f1"/>
            <circle cx="50" cy="30" r="2" fill="#f1c40f"/>
        </svg>`
    }
];

/**
 * Calculate the current sale price based on market demand
 * @returns {number} The effective sale price
 */
function calculateSalePrice() {
    // Adjust price based on current demand
    const demandFactor = game.demand / 100;
    return game.price * demandFactor;
}

/**
 * Calculate the auto production rate
 */
function calculateAutoRate() {
    // Base rate from producers
    let rate = game.autoProducers;
    
    // Apply efficiency multiplier
    const efficiencyMultiplier = Math.pow(2, game.efficiencyLevel);
    rate *= efficiencyMultiplier;
    
    // Apply quality materials bonus
    if (game.researchComplete.qualityMaterials) {
        rate *= 2;
    }
    
    // Add factory production
    rate += game.factoryCount * 25;
    
    // Multiply by market count (international markets)
    rate *= game.marketCount;
    
    // Multiply by product lines (diversification)
    rate *= game.productLines;
    
    // Set the game's auto rate
    game.autoRate = rate;
}

/**
 * Sell products and update game state
 * @param {number} amount - The number of products to sell
 * @returns {boolean} Whether the sale was successful
 */
function sellProducts(amount) {
    // Make sure we're selling a valid amount
    amount = Math.min(game.products, Math.floor(amount));
    
    if (amount > 0) {
        const salePrice = calculateSalePrice() * amount;
        game.products -= amount;
        game.money += salePrice;
        
        // Adjust demand (lower when selling a lot)
        if (amount > 1) {
            game.demand = Math.max(50, game.demand - (amount * 0.05));
        }
        
        return true;
    }
    return false;
}

/**
 * Upgrade to the next product tier
 */
function upgradeProductTier() {
    if (game.productTier < productTiers.length) {
        game.productTier++;
        
        // Update the player's level
        game.playerLevel = productTiers[game.productTier - 1].playerLevel;
        
        // Update the base price
        game.price = productTiers[game.productTier - 1].basePrice;
        
        // Clear inventory when upgrading product tier
        game.products = 0;
        
        return true;
    }
    return false;
}

/**
 * Check for unlockable features based on game progress
 */
function checkUnlocks() {
    // Unlock efficiency upgrades
    if (game.autoProducers >= 5 && !game.unlocks.efficiency) {
        game.unlocks.efficiency = true;
    }
    
    // Unlock marketing
    if (game.money >= productTiers[game.productTier - 1].basePrice * 15 && !game.unlocks.marketing) {
        game.unlocks.marketing = true;
    }
    
    // Unlock quality materials research
    if (game.researchComplete.marketTrends && !game.unlocks.qualityMaterials) {
        game.unlocks.qualityMaterials = true;
    }
    
    // Unlock automation research
    if (game.researchComplete.marketTrends && !game.unlocks.automation) {
        game.unlocks.automation = true;
    }
    
    // Unlock factory
    if (game.researchComplete.automation && !game.unlocks.factory) {
        game.unlocks.factory = true;
    }
    
    // Unlock market expansion
    if (game.factoryCount >= 1 && !game.unlocks.expansion) {
        game.unlocks.expansion = true;
    }
    
    // Unlock product diversification
    if (game.marketCount >= 2 && !game.unlocks.diversification) {
        game.unlocks.diversification = true;
    }
    
    // Check for product tier upgrades
    if (game.productTier === 1 && game.money >= 1000) {
        addMessage("You've saved enough to start producing T-Shirts!");
    }
    
    if (game.productTier === 2 && game.money >= 5000) {
        addMessage("You've saved enough to start producing Jeans!");
    }
    
    if (game.productTier === 3 && game.money >= 20000) {
        addMessage("You've saved enough to start producing Suits!");
    }
}

/**
 * Update game state on each tick
 */
function updateGameState() {
    const now = Date.now();
    const delta = (now - game.lastUpdate) / 1000; // Convert to seconds
    game.lastUpdate = now;
    
    // Auto production
    if (game.autoRate > 0) {
        const newProducts = game.autoRate * delta;
        game.products += newProducts;
    }
    
    // Auto sell if enabled (now works on entire inventory)
    if (game.hasAutoSell && game.products > 0) {
        // Calculate how many products to sell based on demand
        const demandFactor = game.demand / 100;
        const sellRate = game.autoRate * delta * demandFactor;
        // Ensure we sell at least a minimum amount if we have any products
        const amountToSell = Math.min(game.products, Math.max(0.1, sellRate));
        
        if (amountToSell > 0) {
            const salePrice = calculateSalePrice() * amountToSell;
            game.products -= amountToSell;
            game.money += salePrice;
            
            // Gentler demand adjustment
            game.demand = Math.max(50, game.demand - (amountToSell * 0.005));
        }
    }
    
    // Gradually restore demand (market recovery)
    const maxDemand = 100 + (game.marketingLevel * 20);
    game.demand = Math.min(maxDemand, game.demand + (0.2 * delta));
    
    // Progress research
    updateResearch(delta);
    
    // Check for unlocks
    checkUnlocks();
}

/**
 * Update research progress
 * @param {number} delta - Time delta in seconds
 */
function updateResearch(delta) {
    // Market Trends research
    if (game.researchProgress.marketTrends > 0 && 
        !game.researchComplete.marketTrends) {
        
        game.researchProgress.marketTrends += 5 * delta;
        
        if (game.researchProgress.marketTrends >= 100) {
            game.researchProgress.marketTrends = 100;
            game.researchComplete.marketTrends = true;
            addMessage("Market Trends research complete! New insights unlocked.");
        }
    }
    
    // Quality Materials research
    if (game.researchProgress.qualityMaterials > 0 && 
        !game.researchComplete.qualityMaterials) {
        
        game.researchProgress.qualityMaterials += 3 * delta;
        
        if (game.researchProgress.qualityMaterials >= 100) {
            game.researchProgress.qualityMaterials = 100;
            game.researchComplete.qualityMaterials = true;
            calculateAutoRate();
            addMessage("Quality Materials research complete! Production efficiency doubled.");
        }
    }
    
    // Automation research
    if (game.researchProgress.automation > 0 && 
        !game.researchComplete.automation) {
        
        game.researchProgress.automation += 2 * delta;
        
        if (game.researchProgress.automation >= 100) {
            game.researchProgress.automation = 100;
            game.researchComplete.automation = true;
            addMessage("Automation research complete! Factory production now available.");
        }
    }
}

/**
 * Format money values for display
 * @param {number} amount - The money amount to format
 * @returns {string} Formatted money string
 */
function formatMoney(amount) {
    return amount.toFixed(2);
}
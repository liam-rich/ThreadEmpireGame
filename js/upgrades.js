/**
 * Upgrades Management
 * Defines available upgrades and their functionality
 */

// Define all available upgrades
const upgradeDefinitions = {
    // Basic upgrades
    producer: {
        id: 'producer',
        title: 'Workshop',
        description: 'Produces 1 item per second automatically.',
        baseCost: 50,
        costMultiplier: 1.8, // Increased to make scaling harder
        getDescription: () => `Produces 1 ${productTiers[game.productTier - 1].name} per second automatically.`,
        getCost: () => Math.floor(upgradeDefinitions.producer.baseCost * 
                               Math.pow(upgradeDefinitions.producer.costMultiplier, game.autoProducers) * 
                               Math.pow(2, game.productTier - 1))
    },
    
    autoSell: {
        id: 'autoSell',
        title: 'Online Store',
        description: 'Automatically sells products as they are produced.',
        cost: 200, // Increased from 150
        getCost: () => upgradeDefinitions.autoSell.cost * Math.pow(2, game.productTier - 1)
    },
    
    efficiency: {
        id: 'efficiency',
        title: 'Production Efficiency',
        description: 'Increases workshop output by 50%.', // Changed from doubles to 50%
        baseCost: 350, // Increased from 300
        costMultiplier: 4, // Increased from 3
        getCost: () => upgradeDefinitions.efficiency.baseCost * 
                       Math.pow(upgradeDefinitions.efficiency.costMultiplier, game.efficiencyLevel) * 
                       Math.pow(2, game.productTier - 1)
    },
    
    marketing: {
        id: 'marketing',
        title: 'Marketing Campaign',
        description: 'Increases maximum market demand by 10%.', // Reduced from 20%
        baseCost: 250, // Increased from 200
        costMultiplier: 2.5, // Increased from 2
        getCost: () => upgradeDefinitions.marketing.baseCost * 
                       Math.pow(upgradeDefinitions.marketing.costMultiplier, game.marketingLevel) * 
                       Math.pow(2, game.productTier - 1)
    },
    
    // Advanced upgrades
    factory: {
        id: 'factory',
        title: 'Factory',
        description: 'Produces 10 items per second automatically.', // Reduced from 25
        baseCost: 20000, // Increased from 15000
        costMultiplier: 2.5, // Increased from 2
        getDescription: () => `Produces 10 ${productTiers[game.productTier - 1].name} per second automatically.`,
        getCost: () => upgradeDefinitions.factory.baseCost * 
                       Math.pow(upgradeDefinitions.factory.costMultiplier, game.factoryCount) * 
                       Math.pow(1.5, game.productTier - 1)
    },
    
    marketExpansion: {
        id: 'marketExpansion',
        title: 'International Expansion',
        description: 'Expand to international markets, increasing production by 50%.', // Changed from multiplying
        baseCost: 50000, // Increased from 30000
        costMultiplier: 4, // Increased from 3
        getCost: () => upgradeDefinitions.marketExpansion.baseCost * 
                       Math.pow(upgradeDefinitions.marketExpansion.costMultiplier, game.marketCount - 1) * 
                       Math.pow(1.5, game.productTier - 1)
    },
    
    productLine: {
        id: 'productLine',
        title: 'Product Line Expansion',
        description: 'Add a new product line, increasing production by 30%.', // Changed from multiplying
        baseCost: 100000, // Increased from 75000
        costMultiplier: 5, // Increased from 4
        getCost: () => upgradeDefinitions.productLine.baseCost * 
                       Math.pow(upgradeDefinitions.productLine.costMultiplier, game.productLines - 1) * 
                       Math.pow(1.5, game.productTier - 1)
    },
    
    productTier: {
        id: 'productTier',
        title: 'Upgrade Product Line',
        description: 'Upgrade to the next tier of products.',
        getCost: () => {
            switch(game.productTier) {
                case 1: return 1500;  // Increased from 1000 (T-Shirts)
                case 2: return 8000;  // Increased from 5000 (Jeans)
                case 3: return 30000; // Increased from 20000 (Suits)
                default: return Infinity;
            }
        },
        getTitle: () => {
            if (game.productTier >= productTiers.length) {
                return "Maximum Tier Reached";
            }
            return `Upgrade to ${productTiers[game.productTier].name}`;
        },
        getDescription: () => {
            if (game.productTier >= productTiers.length) {
                return "You've reached the highest product tier!";
            }
            return `Upgrade your business to produce ${productTiers[game.productTier].name}.`;
        }
    }
};
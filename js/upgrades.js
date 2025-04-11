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
        costMultiplier: 1.5,
        getDescription: () => `Produces 1 ${productTiers[game.productTier - 1].name} per second automatically.`,
        getCost: () => Math.floor(upgradeDefinitions.producer.baseCost * 
                               Math.pow(upgradeDefinitions.producer.costMultiplier, game.autoProducers) * 
                               Math.pow(2, game.productTier - 1))
    },
    
    autoSell: {
        id: 'autoSell',
        title: 'Online Store',
        description: 'Automatically sells products as they are produced.',
        cost: 150,
        getCost: () => upgradeDefinitions.autoSell.cost * Math.pow(2, game.productTier - 1)
    },
    
    efficiency: {
        id: 'efficiency',
        title: 'Production Efficiency',
        description: 'Doubles the output of all workshops.',
        baseCost: 300,
        costMultiplier: 3,
        getCost: () => upgradeDefinitions.efficiency.baseCost * 
                       Math.pow(upgradeDefinitions.efficiency.costMultiplier, game.efficiencyLevel) * 
                       Math.pow(2, game.productTier - 1)
    },
    
    marketing: {
        id: 'marketing',
        title: 'Marketing Campaign',
        description: 'Increases market demand by 20%.',
        baseCost: 200,
        costMultiplier: 2,
        getCost: () => upgradeDefinitions.marketing.baseCost * 
                       Math.pow(upgradeDefinitions.marketing.costMultiplier, game.marketingLevel) * 
                       Math.pow(2, game.productTier - 1)
    },
    
    // Advanced upgrades
    factory: {
        id: 'factory',
        title: 'Factory',
        description: 'Produces 25 items per second automatically.',
        baseCost: 15000,
        costMultiplier: 2,
        getDescription: () => `Produces 25 ${productTiers[game.productTier - 1].name} per second automatically.`,
        getCost: () => upgradeDefinitions.factory.baseCost * 
                       Math.pow(upgradeDefinitions.factory.costMultiplier, game.factoryCount) * 
                       Math.pow(1.5, game.productTier - 1)
    },
    
    marketExpansion: {
        id: 'marketExpansion',
        title: 'International Expansion',
        description: 'Expand to international markets, multiplying all production.',
        baseCost: 30000,
        costMultiplier: 3,
        getCost: () => upgradeDefinitions.marketExpansion.baseCost * 
                       Math.pow(upgradeDefinitions.marketExpansion.costMultiplier, game.marketCount - 1) * 
                       Math.pow(1.5, game.productTier - 1)
    },
    
    productLine: {
        id: 'productLine',
        title: 'Product Line Expansion',
        description: 'Add a new product line, multiplying all production.',
        baseCost: 75000,
        costMultiplier: 4,
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
                case 1: return 1000;  // Upgrade to T-Shirts
                case 2: return 5000;  // Upgrade to Jeans
                case 3: return 20000; // Upgrade to Suits
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
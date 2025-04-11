/**
 * Upgrade Connector
 * This file bridges the gap between your existing upgrade UI and the game mechanics
 * Add this as a new file in your project
 */

/**
 * Purchase and apply an upgrade
 * @param {string} upgradeId - The ID of the upgrade to purchase
 * @returns {boolean} Whether the purchase was successful
 */
function purchaseUpgrade(upgradeId) {
    const upgrade = upgradeDefinitions[upgradeId];
    
    if (!upgrade) {
        console.error("Upgrade not found:", upgradeId);
        return false;
    }
    
    const cost = upgrade.getCost ? upgrade.getCost() : upgrade.cost;
    
    // Check if player can afford the upgrade
    if (game.money < cost) {
        console.log("Cannot afford upgrade:", upgradeId);
        return false;
    }
    
    // Apply the upgrade based on its ID
    switch (upgradeId) {
        case 'producer':
            game.autoProducers++;
            calculateAutoRate(); // Recalculate auto production rate
            addMessage(`Purchased a new workshop!`);
            break;
            
        case 'autoSell':
            game.hasAutoSell = true;
            game.unlocks.autoSell = true;
            addMessage(`Activated auto-selling! Products will now sell automatically.`);
            break;
            
        case 'efficiency':
            game.efficiencyLevel++;
            calculateAutoRate(); // Recalculate with new efficiency
            addMessage(`Increased production efficiency to level ${game.efficiencyLevel}!`);
            break;
            
        case 'marketing':
            game.marketingLevel++;
            addMessage(`Increased marketing to level ${game.marketingLevel}!`);
            break;
            
        case 'factory':
            game.factoryCount++;
            calculateAutoRate(); // Recalculate with new factory
            addMessage(`Built a new factory!`);
            break;
            
        case 'marketExpansion':
            game.marketCount++;
            calculateAutoRate(); // Recalculate with new market
            addMessage(`Expanded to a new market! Now in ${game.marketCount} markets.`);
            break;
            
        case 'productLine':
            game.productLines++;
            calculateAutoRate(); // Recalculate with new product line
            addMessage(`Added a new product line! Now producing ${game.productLines} types of products.`);
            break;
            
        case 'productTier':
            const oldTier = game.productTier;
            upgradeProductTier(); // Use existing function
            updateProductVisuals();
            addMessage(`Upgraded from ${productTiers[oldTier-1].name} to ${productTiers[game.productTier-1].name}!`);
            break;
            
        default:
            console.error("Unknown upgrade:", upgradeId);
            return false;
    }
    
    // Deduct the cost
    game.money -= cost;
    
    return true;
}

/**
 * Modify the existing attachUpgradeEventListeners function to use purchaseUpgrade
 */
function patchUpgradeSystem() {
    // Override the existing attachUpgradeEventListeners function
    window.originalAttachUpgradeEventListeners = window.attachUpgradeEventListeners;
    
    window.attachUpgradeEventListeners = function() {
        // Get all upgrade buttons
        const upgradeButtons = document.querySelectorAll('[id^="buy-"]');
        
        // Add click handlers
        upgradeButtons.forEach(button => {
            // Extract the upgrade ID from the button ID
            const upgradeId = button.id.replace('buy-', '');
            
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener using purchaseUpgrade
            newButton.addEventListener('click', () => {
                const success = purchaseUpgrade(upgradeId);
                if (success) {
                    updateUI();
                }
            });
        });
    };
    
    // Patch the advanced upgrade listeners too
    window.originalAttachAdvancedUpgradeEventListeners = window.attachAdvancedUpgradeEventListeners;
    
    window.attachAdvancedUpgradeEventListeners = function() {
        // Get all advanced upgrade buttons
        const advancedUpgradeButtons = document.querySelectorAll('[id^="buy-"]');
        
        // Add click handlers
        advancedUpgradeButtons.forEach(button => {
            // Extract the upgrade ID from the button ID
            const upgradeId = button.id.replace('buy-', '');
            
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener using purchaseUpgrade
            newButton.addEventListener('click', () => {
                const success = purchaseUpgrade(upgradeId);
                if (success) {
                    updateUI();
                }
            });
        });
    };
}

// Call the patch function when the script loads
document.addEventListener('DOMContentLoaded', patchUpgradeSystem);
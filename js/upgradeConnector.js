/**
 * Upgrade Connector
 * This file bridges the gap between your existing upgrade UI and the game mechanics
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

// Direct attachment function - will be called from patchUpgradeSystem
function directAttachListeners() {
    // Find all upgrade buttons in the DOM and attach handlers
    const allButtons = document.querySelectorAll('[id^="buy-"]');
    
    allButtons.forEach(button => {
        // Clear existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add our own listener
        const upgradeId = newButton.id.replace('buy-', '');
        newButton.addEventListener('click', () => {
            console.log("Upgrade button clicked:", upgradeId);
            const success = purchaseUpgrade(upgradeId);
            if (success) {
                updateUI();
            }
        });
    });
}

// Function to patch the existing upgrade system
function patchUpgradeSystem() {
    // Override the original event attachment functions
    if (window.attachUpgradeEventListeners) {
        window.originalAttachUpgradeEventListeners = window.attachUpgradeEventListeners;
        window.attachUpgradeEventListeners = directAttachListeners;
    }
    
    if (window.attachAdvancedUpgradeEventListeners) {
        window.originalAttachAdvancedUpgradeEventListeners = window.attachAdvancedUpgradeEventListeners;
        window.attachAdvancedUpgradeEventListeners = directAttachListeners;
    }
    
    // Run immediately and also set up to run after UI updates
    const originalUpdateUI = window.updateUI;
    if (originalUpdateUI) {
        window.updateUI = function() {
            originalUpdateUI();
            // After UI update, reattach listeners
            setTimeout(directAttachListeners, 100);
        };
    }
    
    // Run immediately
    setTimeout(directAttachListeners, 100);
}

// Call the patch function when document loads
window.addEventListener('DOMContentLoaded', patchUpgradeSystem);
// Also call when window loads as a fallback
window.addEventListener('load', patchUpgradeSystem);
// And call it right now in case page is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    patchUpgradeSystem();
}
/**
 * DIRECT Upgrade Connector
 * This file completely replaces the existing upgrade handling with direct DOM manipulation
 */

console.log("Direct upgrade connector loaded!");

// Function to apply an upgrade immediately when a button is clicked
function applyUpgrade(upgradeId) {
    console.log("Applying upgrade:", upgradeId);
    
    const upgrade = upgradeDefinitions[upgradeId];
    if (!upgrade) {
        console.error("Upgrade not found:", upgradeId);
        return;
    }
    
    const cost = upgrade.getCost ? upgrade.getCost() : upgrade.cost;
    
    if (game.money < cost) {
        console.log("Cannot afford upgrade:", upgradeId);
        return;
    }
    
    // Apply the upgrade effects
    switch (upgradeId) {
        case 'producer':
            game.money -= cost;
            game.autoProducers++;
            calculateAutoRate();
            addMessage(`Purchased a new workshop!`);
            console.log("Added workshop:", game.autoProducers);
            break;
            
        case 'autoSell':
            game.money -= cost;
            game.hasAutoSell = true;
            game.unlocks.autoSell = true;
            addMessage(`Activated auto-selling! Products will now sell automatically.`);
            break;
            
        case 'efficiency':
            game.money -= cost;
            game.efficiencyLevel++;
            calculateAutoRate();
            addMessage(`Increased production efficiency to level ${game.efficiencyLevel}!`);
            break;
            
        case 'marketing':
            game.money -= cost;
            game.marketingLevel++;
            addMessage(`Increased marketing to level ${game.marketingLevel}!`);
            break;
            
        case 'factory':
            game.money -= cost;
            game.factoryCount++;
            calculateAutoRate();
            addMessage(`Built a new factory!`);
            break;
            
        case 'marketExpansion':
            game.money -= cost;
            game.marketCount++;
            calculateAutoRate();
            addMessage(`Expanded to a new market! Now in ${game.marketCount} markets.`);
            break;
            
        case 'productLine':
            game.money -= cost;
            game.productLines++;
            calculateAutoRate();
            addMessage(`Added a new product line! Now producing ${game.productLines} types of products.`);
            break;
            
        case 'productTier':
            game.money -= cost;
            const oldTier = game.productTier;
            upgradeProductTier();
            updateProductVisuals();
            addMessage(`Upgraded from ${productTiers[oldTier-1].name} to ${productTiers[game.productTier-1].name}!`);
            break;
            
        default:
            console.error("Unknown upgrade:", upgradeId);
            return;
    }
    
    // Force UI update
    updateUI();
}

// Function to directly handle all button clicks in the document
function handleButtonClick(event) {
    const buttonId = event.target.id;
    
    // Handle upgrade buttons
    if (buttonId && buttonId.startsWith('buy-')) {
        event.preventDefault();
        event.stopPropagation();
        
        const upgradeId = buttonId.replace('buy-', '');
        console.log("Upgrade button clicked:", upgradeId);
        applyUpgrade(upgradeId);
        return;
    }
    
    // Handle research buttons
    if (buttonId && buttonId.startsWith('research-') && buttonId.endsWith('-btn')) {
        const researchId = buttonId.replace('research-', '').replace('-btn', '');
        console.log("Research button clicked:", researchId);
        // Let the existing research handler handle this
    }
}

// Monkey patch the UI update function to ensure our event listeners are always attached
function monkeyPatchUI() {
    console.log("Monkey patching UI functions...");
    
    // Save the original updateUI function
    if (!window._originalUpdateUI) {
        window._originalUpdateUI = window.updateUI;
    }
    
    // Replace it with our version that ensures event listeners are attached
    window.updateUI = function() {
        // Call the original
        window._originalUpdateUI.apply(this, arguments);
        
        // Wait a moment for the DOM to update
        setTimeout(() => {
            // Find all upgrade buttons
            document.querySelectorAll('[id^="buy-"]').forEach(button => {
                // Mark button as processed to avoid double-binding
                if (!button.hasAttribute('data-processed')) {
                    button.setAttribute('data-processed', 'true');
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const upgradeId = this.id.replace('buy-', '');
                        console.log("Direct button click:", upgradeId);
                        applyUpgrade(upgradeId);
                    });
                }
            });
        }, 50);
    };
    
    // Do the same for the other UI update functions
    if (!window._originalUpdateUpgradesUI) {
        window._originalUpdateUpgradesUI = window.updateUpgradesUI;
    }
    
    window.updateUpgradesUI = function() {
        window._originalUpdateUpgradesUI.apply(this, arguments);
        setTimeout(() => {
            document.querySelectorAll('[id^="buy-"]').forEach(button => {
                if (!button.hasAttribute('data-processed')) {
                    button.setAttribute('data-processed', 'true');
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const upgradeId = this.id.replace('buy-', '');
                        console.log("Direct button click (updateUpgradesUI):", upgradeId);
                        applyUpgrade(upgradeId);
                    });
                }
            });
        }, 50);
    };
    
    if (!window._originalUpdateAdvancedUI) {
        window._originalUpdateAdvancedUI = window.updateAdvancedUI;
    }
    
    window.updateAdvancedUI = function() {
        window._originalUpdateAdvancedUI.apply(this, arguments);
        setTimeout(() => {
            document.querySelectorAll('[id^="buy-"]').forEach(button => {
                if (!button.hasAttribute('data-processed')) {
                    button.setAttribute('data-processed', 'true');
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const upgradeId = this.id.replace('buy-', '');
                        console.log("Direct button click (updateAdvancedUI):", upgradeId);
                        applyUpgrade(upgradeId);
                    });
                }
            });
        }, 50);
    };
    
    // Also do it for the attachment functions
    window.attachUpgradeEventListeners = function() {
        // Do nothing - we'll handle this ourselves
        console.log("Intercepted attachUpgradeEventListeners");
    };
    
    window.attachAdvancedUpgradeEventListeners = function() {
        // Do nothing - we'll handle this ourselves
        console.log("Intercepted attachAdvancedUpgradeEventListeners");
    };
}

// Also directly attach a global click handler to catch all button clicks
function attachGlobalHandler() {
    console.log("Attaching global handler");
    document.addEventListener('click', function(event) {
        // Check if this is a button with an ID that starts with "buy-"
        if (event.target && event.target.tagName === 'BUTTON' && 
            event.target.id && event.target.id.startsWith('buy-')) {
            console.log("Global handler caught click on:", event.target.id);
            const upgradeId = event.target.id.replace('buy-', '');
            applyUpgrade(upgradeId);
        }
    });
}

// Initialize our patch
function initDirectPatch() {
    console.log("Initializing direct patch");
    monkeyPatchUI();
    attachGlobalHandler();
    
    // Trigger an immediate UI update to attach our handlers
    if (window.updateUI) {
        window.updateUI();
    }
}

// Run immediately when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDirectPatch);
} else {
    initDirectPatch();
}

// Also run on window load as a backup
window.addEventListener('load', initDirectPatch);

// Run now
initDirectPatch();
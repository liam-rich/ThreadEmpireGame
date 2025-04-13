/**
 * UI Management
 * Handles all UI updates and event listeners
 */

// DOM element references
const elements = {
    // Resources
    productCount: document.getElementById('product-count'),
    productName: document.getElementById('product-name'),
    money: document.getElementById('money'),
    price: document.getElementById('price'),
    priceContainer: document.getElementById('price-controls'),
    currentPrice: document.getElementById('price'),
    demand: document.getElementById('demand'),
    
    // Production
    makeButton: document.getElementById('make-product'),
    productDisplay: document.getElementById('product-display'),
    autoInfo: document.getElementById('auto-info'),
    autoRate: document.getElementById('auto-rate'),
    autoSellInfo: document.getElementById('auto-sell-info'),
    
    // Tabs
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    advancedTab: document.getElementById('advanced-tab'),
    
    // Lists
    upgradesList: document.getElementById('upgrades-list'),
    researchList: document.getElementById('research-list'),
    advancedList: document.getElementById('advanced-list'),
    
    // Player info
    playerLevel: document.getElementById('level'),
    
    // Messages
    messages: document.getElementById('messages'),
    
    // Upgrade buttons
    buyProducerBtn: document.getElementById('buy-producer'),
    buyAutoSellBtn: document.getElementById('buy-auto-sell')
};

// Upgrade costs
const PRODUCER_COST = 50;
const AUTO_SELL_COST = 200;

/**
 * Add a message to the message log
 * @param {string} text - The message text
 */
function addMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    elements.messages.prepend(message); // Add new messages to the top
    
    // Only keep the last 10 messages
    while (elements.messages.childNodes.length > 10) {
        elements.messages.removeChild(elements.messages.lastChild);
    }
}

/**
 * Apply the upgrade effect when button is clicked
 * @param {string} upgradeId - The upgrade identifier
 */
function applyUpgrade(upgradeId) {
    console.log("Applying upgrade:", upgradeId);
    
    const upgrade = upgradeDefinitions[upgradeId];
    if (!upgrade) {
        console.error("Unknown upgrade:", upgradeId);
        return;
    }
    
    // Calculate cost
    const cost = upgrade.getCost ? upgrade.getCost() : upgrade.cost;
    
    if (game.money < cost) {
        console.log("Cannot afford upgrade:", upgradeId);
        return;
    }
    
    // Apply the upgrade effects
    game.money -= cost;
    
    switch (upgradeId) {
        case 'producer':
            game.autoProducers++;
            calculateAutoRate();
            addMessage(`Purchased a new workshop!`);
            break;
            
        case 'autoSell':
            game.hasAutoSell = true;
            addMessage(`Activated auto-selling! Products will now sell automatically based on market demand.`);
            console.log("Auto-sell activated"); // Debug message
            break;
            
        case 'efficiency':
            game.efficiencyLevel++;
            calculateAutoRate();
            addMessage(`Increased production efficiency to level ${game.efficiencyLevel}!`);
            break;
            
        case 'marketing':
            game.marketingLevel++;
            addMessage(`Increased marketing to level ${game.marketingLevel}!`);
            break;
            
        case 'factory':
            game.factoryCount++;
            calculateAutoRate();
            addMessage(`Built a new factory!`);
            break;
            
        case 'marketExpansion':
            game.marketCount++;
            calculateAutoRate();
            addMessage(`Expanded to a new market! Now in ${game.marketCount} markets.`);
            break;
            
        case 'productLine':
            game.productLines++;
            calculateAutoRate();
            addMessage(`Added a new product line! Now producing ${game.productLines} types of products.`);
            break;
            
        case 'productTier':
            const oldTier = game.productTier;
            upgradeProductTier();
            updateProductVisuals();
            addMessage(`Upgraded from ${productTiers[oldTier-1].name} to ${productTiers[game.productTier-1].name}!`);
            break;
            
        default:
            console.error("Unknown upgrade:", upgradeId);
            return;
    }
    
    // Update UI
    updateUI();
}

/**
 * Generate HTML for an upgrade
 * @param {string} upgradeId - The ID of the upgrade
 * @returns {string} HTML markup for the upgrade
 */
function generateUpgradeHTML(upgradeId) {
    const upgrade = upgradeDefinitions[upgradeId];
    if (!upgrade) return '';
    
    let title = upgrade.title;
    let description = upgrade.description;
    let cost;
    
    // Handle dynamic content
    if (upgrade.getTitle) {
        title = upgrade.getTitle();
    }
    
    if (upgrade.getDescription) {
        description = upgrade.getDescription();
    }
    
    if (upgrade.getCost) {
        cost = upgrade.getCost();
    } else {
        cost = upgrade.cost;
    }
    
    // Handle special cases
    let statusText = '';
    let buttonText = 'BUY';
    let buttonDisabled = game.money < cost;
    
    switch (upgradeId) {
        case 'autoSell':
            statusText = game.hasAutoSell ? 'Active' : 'Not Active';
            buttonDisabled = game.hasAutoSell || game.money < cost;
            break;
        case 'producer':
            statusText = `Owned: ${game.autoProducers}`;
            break;
        case 'efficiency':
            statusText = `Level: ${game.efficiencyLevel}`;
            break;
        case 'marketing':
            statusText = `Level: ${game.marketingLevel}`;
            break;
        case 'factory':
            statusText = `Owned: ${game.factoryCount}`;
            break;
        case 'marketExpansion':
            statusText = `Markets: ${game.marketCount}`;
            break;
        case 'productLine':
            statusText = `Product Lines: ${game.productLines}`;
            break;
        case 'productTier':
            buttonText = 'UPGRADE';
            if (game.productTier >= productTiers.length) {
                buttonDisabled = true;
            }
            break;
    }
    
    return `
        <div class="upgrade-item" id="upgrade-${upgradeId}">
            <div class="upgrade-header">
                <div class="upgrade-title">${title}</div>
            </div>
            <div class="upgrade-description">${description}</div>
            <div class="upgrade-cost">Cost: $${formatMoney(cost)}</div>
            <div class="upgrade-action">
                <button class="upgrade-button" id="buy-${upgradeId}" data-upgrade="${upgradeId}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
                <div class="upgrade-status">${statusText}</div>
            </div>
        </div>
    `;
}

/**
 * Update the upgrades UI
 */
function updateUpgradesUI() {
    let html = '';
    
    // Always show the base producer upgrade
    html += generateUpgradeHTML('producer');
    
    // Show auto-sell if unlocked
    if (game.unlocks.autoSell) {
        html += generateUpgradeHTML('autoSell');
    }
    
    // Show efficiency upgrade if unlocked
    if (game.unlocks.efficiency) {
        html += generateUpgradeHTML('efficiency');
    }
    
    // Show marketing upgrade if unlocked
    if (game.unlocks.marketing) {
        html += generateUpgradeHTML('marketing');
    }
    
    // Show product tier upgrade if applicable
    if (game.productTier < productTiers.length) {
        const tierUpgradeCost = upgradeDefinitions.productTier.getCost();
        if (game.money >= tierUpgradeCost * 0.5) { // Show when player has at least 50% of the cost
            html += generateUpgradeHTML('productTier');
        }
    }
    
    elements.upgradesList.innerHTML = html;
}

/**
 * Update the advanced upgrades UI
 */
function updateAdvancedUI() {
    if (!game.unlocks.factory) return;
    
    let html = '';
    
    // Show factory upgrade
    html += generateUpgradeHTML('factory');
    
    // Show market expansion if unlocked
    if (game.unlocks.expansion) {
        html += generateUpgradeHTML('marketExpansion');
    }
    
    // Show product diversification if unlocked
    if (game.unlocks.diversification) {
        html += generateUpgradeHTML('productLine');
    }
    
    elements.advancedList.innerHTML = html;
    
    // Show the advanced tab
    elements.advancedTab.style.display = 'block';
}

/**
 * Update the product visuals
 */
function updateProductVisuals() {
    // Update product name
    elements.productName.textContent = productTiers[game.productTier - 1].name;
    
    // Update make button text
    elements.makeButton.textContent = productTiers[game.productTier - 1].makeBtnText;
    
    // Update product SVG
    elements.productDisplay.innerHTML = productTiers[game.productTier - 1].svgPath;
    
    // Update player level
    elements.playerLevel.textContent = productTiers[game.productTier - 1].playerLevel;
}

/**
 * Format money for display
 */
function formatMoney(amount) {
    return Number(amount).toFixed(2);
}

/**
 * Update all UI elements based on game state
 */
function updateUI() {
    // Update resource displays with proper number formatting
    elements.productCount.textContent = Math.floor(game.products);
    elements.money.textContent = formatMoney(game.money);
    elements.price.textContent = formatMoney(game.price);
    elements.demand.textContent = Math.floor(game.demand);
    
    // Update auto production info
    if (game.autoRate > 0) {
        elements.autoInfo.style.display = 'block';
        elements.autoRate.textContent = game.autoRate.toFixed(1);
    } else {
        elements.autoInfo.style.display = 'none';
    }
    
    // Update upgrades
    updateUpgradesUI();
    
    // Update research
    updateResearchUI();
    
    // Update advanced upgrades if unlocked
    if (game.unlocks.factory) {
        updateAdvancedUI();
    }
    
    // Update buttons
    elements.buyProducerBtn.disabled = game.money < PRODUCER_COST;
    if (elements.buyAutoSellBtn) {
        elements.buyAutoSellBtn.disabled = game.money < AUTO_SELL_COST || game.hasAutoSell;
    }
    
    // Add click handlers after DOM updates
    setTimeout(attachUpgradeHandlers, 10);
}

/**
 * Attach event handlers to all upgrade buttons
 */
function attachUpgradeHandlers() {
    // Find all upgrade buttons
    document.querySelectorAll('.upgrade-button').forEach(button => {
        // Remove existing handlers by cloning and replacing
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            const upgradeId = this.getAttribute('data-upgrade');
            applyUpgrade(upgradeId);
        });
    });
    
    // Find all research buttons
    document.querySelectorAll('[id^="research-"][id$="-btn"]').forEach(button => {
        // Remove existing handlers by cloning and replacing
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            const researchId = this.id.replace('research-', '').replace('-btn', '');
            startResearch(researchId);
            updateUI();
        });
    });
}

/**
 * Initialize tab functionality
 */
function initTabs() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hide all tab contents
            elements.tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Deactivate all tab buttons
            elements.tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show the selected tab content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Activate the clicked button
            button.classList.add('active');
        });
    });
}

/**
 * Initialize UI event listeners
 */
function initializeUI() {
    // Manual production
    elements.makeButton.addEventListener('click', () => {
        game.products++;
        updateUI();
    });
    
    // Add price adjustment buttons
    const decreasePriceBtn = document.createElement('button');
    decreasePriceBtn.id = 'decrease-price';
    decreasePriceBtn.textContent = '-$0.50';
    
    const increasePriceBtn = document.createElement('button');
    increasePriceBtn.id = 'increase-price';
    increasePriceBtn.textContent = '+$0.50';
    
    // Add price controls to the price display area
    const priceDisplay = elements.priceContainer; // Changed from price.parentElement
    priceDisplay.insertBefore(decreasePriceBtn, elements.price);
    priceDisplay.appendChild(increasePriceBtn);
    
    // Add price adjustment event listeners
    decreasePriceBtn.addEventListener('click', () => {
        adjustPrice(-0.50);
        updateUI();
    });
    
    increasePriceBtn.addEventListener('click', () => {
        adjustPrice(0.50);
        updateUI();
    });
    
    // Buy producer (workshop)
    if (elements.buyProducerBtn) {
        elements.buyProducerBtn.addEventListener('click', () => {
            if (game.money >= PRODUCER_COST) {
                game.money -= PRODUCER_COST;
                game.autoProducers++;
                calculateAutoRate();
                console.log('Bought workshop, new count:', game.autoProducers); // Debug log
                updateUI();
            }
        });
    }
    
    // Buy auto-sell
    if (elements.buyAutoSellBtn) {
        elements.buyAutoSellBtn.addEventListener('click', () => {
            if (game.money >= AUTO_SELL_COST && !game.hasAutoSell) {
                game.money -= AUTO_SELL_COST;
                game.hasAutoSell = true;
                console.log('Auto-sell enabled'); // Debug log
                updateUI();
            }
        });
    }
    
    // Manual sell button
    const sellButton = document.getElementById('sell-product');
    if (sellButton) {
        sellButton.addEventListener('click', () => {
            if (game.products > 0) {
                console.log('Manual sell clicked, products:', game.products);
                sellProducts(game.products);
                updateUI();
            }
        });
    }
}

// Global click handler for upgrades
document.addEventListener('click', function(event) {
    // Check if the clicked element is an upgrade button
    if (event.target && event.target.classList && event.target.classList.contains('upgrade-button')) {
        event.preventDefault();
        const upgradeId = event.target.getAttribute('data-upgrade');
        if (upgradeId) {
            console.log("Global click handler: applying upgrade", upgradeId);
            applyUpgrade(upgradeId);
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    updateUI(); // Initial UI update
});
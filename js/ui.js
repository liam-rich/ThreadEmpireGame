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
    messages: document.getElementById('messages')
};

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
                <button id="buy-${upgradeId}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
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
    
    // Add event listeners for upgrade buttons
    attachUpgradeEventListeners();
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
    
    // Add event listeners for advanced upgrade buttons
    attachAdvancedUpgradeEventListeners();
}

/**
 * Attach event listeners to upgrade buttons
 */
function attachUpgradeEventListeners() {
    // Find all upgrade buttons in the upgrades tab
    const upgradeButtons = document.querySelectorAll('#upgrades-list [id^="buy-"]');
    
    // Add click handlers to each button
    upgradeButtons.forEach(button => {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new event listener with direct purchase logic
        newButton.addEventListener('click', function() {
            // Extract the upgrade ID from the button ID
            const upgradeId = this.id.replace('buy-', '');
            console.log("Button clicked:", upgradeId);
            
            // Get the upgrade definition
            const upgrade = upgradeDefinitions[upgradeId];
            if (!upgrade) {
                console.error("Unknown upgrade:", upgradeId);
                return;
            }
            
            // Calculate cost
            const cost = upgrade.getCost ? upgrade.getCost() : upgrade.cost;
            
            // Check if player can afford
            if (game.money < cost) {
                console.log("Cannot afford upgrade:", upgradeId);
                return;
            }
            
            // Apply the upgrade based on its ID
            switch (upgradeId) {
                case 'producer':
                    game.money -= cost;
                    game.autoProducers++;
                    calculateAutoRate();
                    addMessage(`Purchased a new workshop!`);
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
            
            // Update UI
            updateUI();
        });
    });
}

/**
 * Attach event listeners to advanced upgrade buttons
 */
function attachAdvancedUpgradeEventListeners() {
    // Find all upgrade buttons in the advanced tab
    const upgradeButtons = document.querySelectorAll('#advanced-list [id^="buy-"]');
    
    // Add click handlers to each button
    upgradeButtons.forEach(button => {
        // Remove existing event listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new event listener with direct purchase logic
        newButton.addEventListener('click', function() {
            // Extract the upgrade ID from the button ID
            const upgradeId = this.id.replace('buy-', '');
            console.log("Advanced button clicked:", upgradeId);
            
            // Get the upgrade definition
            const upgrade = upgradeDefinitions[upgradeId];
            if (!upgrade) {
                console.error("Unknown upgrade:", upgradeId);
                return;
            }
            
            // Calculate cost
            const cost = upgrade.getCost ? upgrade.getCost() : upgrade.cost;
            
            // Check if player can afford
            if (game.money < cost) {
                console.log("Cannot afford upgrade:", upgradeId);
                return;
            }
            
            // Apply the upgrade based on its ID
            switch (upgradeId) {
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
                    
                default:
                    console.error("Unknown upgrade:", upgradeId);
                    return;
            }
            
            // Update UI
            updateUI();
        });
    });
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
 * Update all UI elements based on game state
 */
function updateUI() {
    // Update resource displays
    elements.productCount.textContent = Math.floor(game.products);
    elements.money.textContent = formatMoney(game.money);
    elements.price.textContent = formatMoney(game.price);
    elements.demand.textContent = Math.floor(game.demand);
    
    // Update auto production info
    if (game.autoRate > 0) {
        elements.autoInfo.classList.remove('hidden');
        elements.autoRate.textContent = formatMoney(game.autoRate);
        
        if (game.hasAutoSell) {
            elements.autoSellInfo.classList.remove('hidden');
        } else {
            elements.autoSellInfo.classList.add('hidden');
        }
    } else {
        elements.autoInfo.classList.add('hidden');
    }
    
    // Update upgrades
    updateUpgradesUI();
    
    // Update research
    updateResearchUI();
    
    // Update advanced upgrades if unlocked
    if (game.unlocks.factory) {
        updateAdvancedUI();
    }
    
    // Ensure the buttons are properly enabled/disabled
    elements.makeButton.disabled = false;
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
 * Initialize core gameplay buttons
 */
function initCoreButtons() {
    // Make product button
    elements.makeButton.addEventListener('click', () => {
        game.products++;
        updateUI();
    });
    
    // Price adjustment buttons
    document.getElementById('decrease-price').addEventListener('click', () => {
        const minPrice = productTiers[game.productTier - 1].basePrice * 0.5;
        if (game.price > minPrice) {
            game.price = Math.max(minPrice, game.price - (productTiers[game.productTier - 1].basePrice * 0.1));
            game.demand = Math.min(100 + (game.marketingLevel * 20), game.demand + 5);
            updateUI();
        }
    });
    
    document.getElementById('increase-price').addEventListener('click', () => {
        game.price += productTiers[game.productTier - 1].basePrice * 0.1;
        game.demand = Math.max(10, game.demand - 5);
        updateUI();
    });
}
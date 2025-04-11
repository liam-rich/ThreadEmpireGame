/**
 * Research System
 * Defines available research projects and their functionality
 */

// Define all available research projects
const researchDefinitions = {
    marketTrends: {
        id: 'marketTrends',
        title: 'Market Trend Analysis',
        description: 'Research customer preferences and market trends to unlock advanced strategies.',
        cost: 500,
        getCost: () => researchDefinitions.marketTrends.cost * Math.pow(2, game.productTier - 1),
        progressId: 'marketTrends'
    },
    
    qualityMaterials: {
        id: 'qualityMaterials',
        title: 'Quality Materials',
        description: 'Research premium materials to double production efficiency.',
        cost: 1200,
        getCost: () => researchDefinitions.qualityMaterials.cost * Math.pow(2, game.productTier - 1),
        progressId: 'qualityMaterials'
    },
    
    automation: {
        id: 'automation',
        title: 'Automation Systems',
        description: 'Research advanced manufacturing automation to unlock factory production.',
        cost: 3000,
        getCost: () => researchDefinitions.automation.cost * Math.pow(2, game.productTier - 1),
        progressId: 'automation'
    }
};

/**
 * Start a research project
 * @param {string} researchId - The ID of the research to start
 * @returns {boolean} Whether the research was successfully started
 */
function startResearch(researchId) {
    const research = researchDefinitions[researchId];
    
    if (!research) return false;
    
    const cost = research.getCost();
    
    if (game.money >= cost && 
        game.researchProgress[research.progressId] === 0 && 
        !game.researchComplete[research.progressId]) {
        
        game.money -= cost;
        game.researchProgress[research.progressId] = 1; // Start with 1% progress
        
        addMessage(`Started ${research.title} research!`);
        return true;
    }
    
    return false;
}

/**
 * Generate HTML for a research item
 * @param {string} researchId - The ID of the research
 * @returns {string} HTML markup for the research item
 */
function generateResearchHTML(researchId) {
    const research = researchDefinitions[researchId];
    
    if (!research) return '';
    
    const cost = research.getCost();
    const isInProgress = game.researchProgress[research.progressId] > 0 && !game.researchComplete[research.progressId];
    const isComplete = game.researchComplete[research.progressId];
    
    let html = `
        <div class="upgrade-item" id="research-${research.id}">
            <div class="upgrade-header">
                <div class="upgrade-title">${research.title}</div>
            </div>
            <div class="upgrade-description">${research.description}</div>
            <div class="upgrade-cost">Cost: $${formatMoney(cost)}</div>
    `;
    
    if (isComplete) {
        html += `<div class="upgrade-status">Research Complete</div>`;
    } else if (isInProgress) {
        html += `
            <div class="progress-container" id="${research.id}-progress-container">
                <div class="progress-bar" id="${research.id}-progress" style="width: ${game.researchProgress[research.progressId]}%"></div>
            </div>
            <div class="upgrade-status">Research in Progress: ${Math.floor(game.researchProgress[research.progressId])}%</div>
        `;
    } else {
        html += `<button id="research-${research.id}-btn" ${game.money < cost ? 'disabled' : ''}>RESEARCH</button>`;
    }
    
    html += `</div>`;
    
    return html;
}

/**
 * Update the research UI
 */
function updateResearchUI() {
    const researchList = document.getElementById('research-list');
    let html = '';
    
    // Always show market trends research
    html += generateResearchHTML('marketTrends');
    
    // Show quality materials if unlocked
    if (game.unlocks.qualityMaterials) {
        html += generateResearchHTML('qualityMaterials');
    }
    
    // Show automation if unlocked
    if (game.unlocks.automation) {
        html += generateResearchHTML('automation');
    }
    
    researchList.innerHTML = html;
    
    // Add event listeners for research buttons
    Object.keys(researchDefinitions).forEach(researchId => {
        const btn = document.getElementById(`research-${researchId}-btn`);
        if (btn) {
            btn.addEventListener('click', () => {
                startResearch(researchId);
                updateUI();
            });
        }
    });
}
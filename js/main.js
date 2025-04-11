/**
 * Main Game Controller
 * Initializes the game and runs the game loop
 */

/**
 * Initialize the game
 */
function initGame() {
    // Set up initial product
    updateProductVisuals();
    
    // Initialize UI tabs
    initTabs();
    
    // Initialize core gameplay buttons
    initCoreButtons();
    
    // Initial UI update
    updateUI();
    
    // Welcome message
    addMessage("Welcome to Thread Empire! Start by making and selling socks.");
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Main game loop
 */
function gameLoop(timestamp) {
    // Update game state
    updateGameState();
    
    // Update UI
    updateUI();
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Start the game when page is loaded
window.addEventListener('load', initGame);
// Arkanoid Game Module
console.log('game-arkanoid.js: Script loading...');

// Game state variables
let gameRunning = false;
let gameWaitingForStart = false;
let ballLaunched = false;
let ballLaunchFrame = 0; // Frame counter since ball launch
let paddle, ball, fishBlocks = [];
let score = 0;
let lives = 3;
let gameAnimationId;
let paddleElement, ballElement, scoreElement, gameFooterElement, spaceHintElement, tapToStartButton;
let gameSpeed = 1.0; // Speed multiplier for game (1.0 = normal speed)
let playerName = 'Player'; // Default player name (name input temporarily disabled)
window.playerName = 'Player'; // Make it global for access from index.html
let waitingForPlayerName = false;
window.waitingForPlayerName = false; // Make it global for access from index.html
let mobileControlLeft, mobileControlRight;

function waitForGameStart() {
    window.waitingForGameResponse = true;
    // Ensure input prompt is visible and focused
    const inputLine = document.getElementById('terminal-input-line');
    const inputEl = document.getElementById('terminal-input');
    if (inputLine) {
        inputLine.style.display = 'flex';
    }
    if (inputEl) {
        setTimeout(() => {
            inputEl.focus();
        }, 100);
    }
}

function handleGameResponse(response) {
    // TEMPORARILY DISABLED: Name input and y/n confirmation
    // Save original response for output
    // const originalResponse = response;
    // const trimmedResponse = response.trim().toLowerCase();
    
    // if (window.waitingForPlayerName) {
    //     // Handle player name input
    //     playerName = originalResponse.trim() || 'Player';
    //     waitingForPlayerName = false;
    //     window.waitingForPlayerName = false;
    //     appendOutput('$ ' + originalResponse, 'terminal-prompt');
    //     appendOutput('');
    //     appendOutput(`Welcome, ${playerName}!`);
    //     appendOutput('');
    //     // Force scroll to bottom
    //     setTimeout(() => {
    //         const monitorContent = document.querySelector('.monitor-content');
    //         if (monitorContent) {
    //             monitorContent.scrollTop = monitorContent.scrollHeight;
    //         }
    //     }, 100);
    //     showGameInstructions();
    //     return;
    // }
    
    // if (trimmedResponse === 'y' || trimmedResponse === 'yes') {
    //     window.waitingForGameResponse = false;
    //     appendOutput('$ ' + originalResponse, 'terminal-prompt');
    //     appendOutput('');
    //     // Request player name
    //     waitingForPlayerName = true;
    //     window.waitingForPlayerName = true;
    //     appendOutput('Enter your name:');
    //     appendOutput('');
    //     // Force scroll to bottom
    //     setTimeout(() => {
    //         const monitorContent = document.querySelector('.monitor-content');
    //         if (monitorContent) {
    //             monitorContent.scrollTop = monitorContent.scrollHeight;
    //         }
    //         const inputEl = document.getElementById('terminal-input');
    //         if (inputEl) {
    //             inputEl.focus();
    //         }
    //     }, 100);
    // } else if (trimmedResponse === 'n' || trimmedResponse === 'no') {
    //     window.waitingForGameResponse = false;
    //     appendOutput('$ ' + originalResponse, 'terminal-prompt');
    //     appendOutput('');
    //     appendOutput('Game cancelled.');
    //     appendOutput('');
    //     // Force scroll to bottom
    //     setTimeout(() => {
    //         const monitorContent = document.querySelector('.monitor-content');
    //         if (monitorContent) {
    //             monitorContent.scrollTop = monitorContent.scrollHeight;
    //         }
    //     }, 100);
    // } else {
    //     // Invalid answer - keep window.waitingForGameResponse = true
    //     appendOutput('$ ' + originalResponse, 'terminal-prompt');
    //     appendOutput('');
    //     appendOutput('Please answer y or n');
    //     appendOutput('');
    //     // Force scroll to bottom
    //     setTimeout(() => {
    //         const monitorContent = document.querySelector('.monitor-content');
    //         if (monitorContent) {
    //             monitorContent.scrollTop = monitorContent.scrollHeight;
    //         }
    //         // Ensure input prompt remains visible
    //         const inputEl = document.getElementById('terminal-input');
    //         if (inputEl) {
    //             inputEl.focus();
    //         }
    //     }, 100);
    // }
    
    // Empty function for now - game starts directly without name input or y/n confirmation
}

// Make handleGameResponse globally accessible
window.handleGameResponse = handleGameResponse;

// Function to check all required dependencies for the game
function checkGameDependencies() {
    const dependencies = [];
    
    // Check for required functions
    if (typeof appendOutput === 'undefined') {
        dependencies.push('appendOutput function');
    }
    if (typeof typeText === 'undefined') {
        dependencies.push('typeText function');
    }
    
    // Check for required data
    if (typeof SiteTexts === 'undefined') {
        dependencies.push('SiteTexts object');
    } else {
        if (!SiteTexts.commands) {
            dependencies.push('SiteTexts.commands');
        } else if (!SiteTexts.commands.game) {
            dependencies.push('SiteTexts.commands.game');
        } else {
            if (!SiteTexts.commands.game.fishArt) {
                dependencies.push('SiteTexts.commands.game.fishArt');
            }
            if (!SiteTexts.commands.game.spacePrompt) {
                dependencies.push('SiteTexts.commands.game.spacePrompt');
            }
        }
    }
    
    // Check for required DOM elements
    if (!document.getElementById('terminal-output')) {
        dependencies.push('terminal-output element');
    }
    if (!document.querySelector('.monitor-content')) {
        dependencies.push('monitor-content element');
    }
    
    if (dependencies.length > 0) {
        console.error('Missing game dependencies:', dependencies);
        return { success: false, missing: dependencies };
    }
    
    console.log('All game dependencies available');
    return { success: true, missing: [] };
}

// Declare and export showGameInstructions immediately
// Export as soon as possible to ensure it's available
function showGameInstructions() {
    try {
        console.log('showGameInstructions called');
        
        // Check all dependencies
        const depCheck = checkGameDependencies();
        if (!depCheck.success) {
            const errorMsg = 'Missing required dependencies: ' + depCheck.missing.join(', ');
            console.error(errorMsg);
            if (typeof appendOutput !== 'undefined') {
                appendOutput('Error: Game cannot start. ' + errorMsg);
            }
            return;
        }
        
        appendOutput('');
        
        // Show fish art immediately at top
        const outputEl = document.getElementById('terminal-output');
        if (!outputEl) {
            console.error('terminal-output element not found');
            return;
        }
        
        const artDiv = document.createElement('pre');
        artDiv.id = 'fish-art';
        artDiv.style.color = 'var(--accent)';
        artDiv.style.margin = '0';
        artDiv.style.padding = '0';
        artDiv.style.lineHeight = '1.1';
        artDiv.style.fontSize = '14px';
        artDiv.style.fontWeight = 'normal';
        artDiv.style.position = 'relative';
        artDiv.style.zIndex = '50';
        outputEl.appendChild(artDiv);
        
        const fishArt = SiteTexts.commands.game.fishArt;
        if (!fishArt) {
            console.error('SiteTexts.commands.game.fishArt is not defined');
            return;
        }
        
        typeText(fishArt, artDiv, () => {
            // Add a few empty lines for spacing
            for (let i = 0; i < 3; i++) {
                appendOutput('');
            }
            
            // Add space prompt in terminal flow, not fixed
            const gamePrompt = document.createElement('div');
            gamePrompt.id = 'game-space-prompt';
            gamePrompt.style.color = 'var(--accent)';
            gamePrompt.style.fontSize = '14px';
            gamePrompt.style.fontFamily = "'Courier New', monospace";
            gamePrompt.style.textAlign = 'center';
            gamePrompt.style.textShadow = '0 0 5px var(--accent)';
            gamePrompt.style.fontWeight = 'bold';
            gamePrompt.style.margin = '20px 0';
            gamePrompt.textContent = SiteTexts.commands.game.spacePrompt;
            outputEl.appendChild(gamePrompt);
            
            // Scroll to show fish at top of view
            const monitorContent = document.querySelector('.monitor-content');
            setTimeout(() => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
                if (isMobile) {
                    // On mobile: scroll to the very top to show fish
                    monitorContent.scrollTop = 0;
                    console.log('Mobile: Scrolled to top, Fish offset:', artDiv.offsetTop);
                } else {
                    // On desktop: scroll to fish art position with small margin
                    const scrollTarget = artDiv.offsetTop - 20;
                    monitorContent.scrollTop = scrollTarget;
                    console.log('Scrolled to:', scrollTarget, 'Fish offset:', artDiv.offsetTop);
                }
            }, 200);
            
            // Wait for DOM update and scroll completion before initializing game
            setTimeout(() => {
                // Check if fish art is ready
                const fishArtElement = document.getElementById('fish-art');
                if (!fishArtElement) {
                    console.error('Fish art element not found after typeText');
                    appendOutput('Error: Game initialization failed. Fish art not ready.');
                    return;
                }
                
                // Set flag BEFORE preparing game
                gameWaitingForStart = true;
                
                // Initialize game setup (but don't start yet)
                prepareGame();
                
                // Create blocks with retry logic - try multiple times with increasing delays
                let retryCount = 0;
                const maxRetries = 5;
                const tryCreateBlocks = () => {
                    console.log(`Attempting to create blocks, attempt ${retryCount + 1}/${maxRetries}`);
                    createTextBlocks();
                    
                    if (fishBlocks.length === 0 && retryCount < maxRetries) {
                        retryCount++;
                        const delay = 300 * retryCount; // Increasing delay: 300ms, 600ms, 900ms, etc.
                        console.warn(`No blocks created, retrying in ${delay}ms...`);
                        setTimeout(tryCreateBlocks, delay);
                    } else if (fishBlocks.length === 0) {
                        console.error('Failed to create fish blocks after all retries');
                        appendOutput('Error: Game initialization failed. Please refresh and try again.');
                    } else {
                        console.log('Successfully created', fishBlocks.length, 'blocks');
                        console.log('Waiting for spacebar, gameWaitingForStart:', gameWaitingForStart);
                    }
                };
                
                // Start trying to create blocks after initial delay
                setTimeout(tryCreateBlocks, 500);
                
                // Wait for spacebar to start
                waitForSpaceToStart();
            }, 500);
        }, 3);
    } catch (error) {
        console.error('Error in showGameInstructions:', error);
        if (typeof appendOutput !== 'undefined') {
            appendOutput('Error initializing game: ' + error.message);
        }
    }
}

// CRITICAL: Export showGameInstructions IMMEDIATELY after definition
// This must be the very next line to ensure it's available
try {
    if (typeof window !== 'undefined') {
        window.showGameInstructions = showGameInstructions;
        console.log('game-arkanoid.js: showGameInstructions exported successfully');
    } else {
        console.error('game-arkanoid.js: window is not available');
    }
} catch (e) {
    console.error('game-arkanoid.js: Error exporting showGameInstructions:', e);
}

function waitForSpaceToStart() {
    const spaceHandler = (e) => {
        console.log('Key pressed:', e.key, 'gameWaitingForStart:', gameWaitingForStart);
        if (e.key === ' ' && gameWaitingForStart) {
            console.log('Spacebar detected, starting game!');
            e.preventDefault();
            gameWaitingForStart = false;
            document.removeEventListener('keydown', spaceHandler);
            
            // Start game immediately
            startGame();
        }
    };
    
    console.log('Adding spacebar handler, gameWaitingForStart:', gameWaitingForStart);
    document.addEventListener('keydown', spaceHandler);
}

function prepareGame() {
    try {
        console.log('prepareGame: Starting game preparation...');
        
        const monitorContent = document.querySelector('.monitor-content');
        if (!monitorContent) {
            console.error('prepareGame: monitor-content not found');
            return;
        }
        
        const contentRect = monitorContent.getBoundingClientRect();
        const gameWidth = contentRect.width;
        const gameHeight = contentRect.height;
        
        console.log('prepareGame: Game dimensions:', { width: gameWidth, height: gameHeight });
        
        // Hide terminal input
        const terminalInputLine = document.getElementById('terminal-input-line');
        if (terminalInputLine) {
            terminalInputLine.style.display = 'none';
        }
        
        // Hide all terminal output except fish
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            Array.from(terminalOutput.children).forEach(child => {
                if (child.id !== 'fish-art') {
                    child.style.display = 'none';
                }
            });
        }
    
    // Create paddle element
    paddleElement = document.createElement('div');
    paddleElement.id = 'game-paddle';
    paddleElement.textContent = '━━━━━━━━━━';
    paddleElement.style.position = 'fixed';
    paddleElement.style.color = 'var(--accent)';
    paddleElement.style.fontSize = '20px';
    paddleElement.style.fontFamily = 'monospace';
    paddleElement.style.textShadow = '0 0 10px var(--accent)';
    paddleElement.style.zIndex = '10003';
    paddleElement.style.pointerEvents = 'none';
    paddleElement.style.lineHeight = '1';
    paddleElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(paddleElement);
    
    // Create ball element
    ballElement = document.createElement('div');
    ballElement.id = 'game-ball';
    ballElement.textContent = '●';
    ballElement.style.position = 'fixed';
    ballElement.style.color = 'var(--accent)';
    ballElement.style.fontSize = '20px';
    ballElement.style.fontFamily = 'monospace';
    ballElement.style.textShadow = '0 0 10px var(--accent)';
    ballElement.style.zIndex = '10004';
    ballElement.style.pointerEvents = 'none';
    ballElement.style.lineHeight = '1';
    document.body.appendChild(ballElement);
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
        // Create "Tap to start" button for mobile
        tapToStartButton = document.createElement('button');
        tapToStartButton.id = 'tap-to-start-button';
        tapToStartButton.textContent = 'Tap to start';
        tapToStartButton.style.position = 'fixed';
        tapToStartButton.style.color = 'var(--accent)';
        tapToStartButton.style.fontSize = '18px';
        tapToStartButton.style.fontFamily = "'Courier New', monospace";
        tapToStartButton.style.textShadow = '0 0 8px var(--accent)';
        tapToStartButton.style.zIndex = '10003';
        tapToStartButton.style.pointerEvents = 'auto';
        tapToStartButton.style.fontWeight = 'bold';
        tapToStartButton.style.opacity = '1';
        tapToStartButton.style.animation = 'blink 1.5s infinite';
        tapToStartButton.style.textAlign = 'center';
        tapToStartButton.style.whiteSpace = 'nowrap';
        tapToStartButton.style.background = 'rgba(0, 0, 0, 0.8)';
        tapToStartButton.style.border = '2px solid var(--accent)';
        tapToStartButton.style.borderRadius = '8px';
        tapToStartButton.style.padding = '15px 30px';
        tapToStartButton.style.cursor = 'pointer';
        tapToStartButton.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
        tapToStartButton.style.userSelect = 'none';
        tapToStartButton.style.touchAction = 'manipulation';
        tapToStartButton.addEventListener('click', () => {
            if (gameWaitingForStart && !ballLaunched) {
                gameWaitingForStart = false;
                startGame();
            }
        });
        tapToStartButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameWaitingForStart && !ballLaunched) {
                gameWaitingForStart = false;
                startGame();
            }
        });
        document.body.appendChild(tapToStartButton);
        
        // Create hidden space hint for desktop (if needed)
        spaceHintElement = document.createElement('div');
        spaceHintElement.id = 'space-hint';
        spaceHintElement.textContent = 'Press SPACE to start';
        spaceHintElement.style.display = 'none';
        document.body.appendChild(spaceHintElement);
    } else {
        // Create "Press SPACE to start" hint for desktop
        spaceHintElement = document.createElement('div');
        spaceHintElement.id = 'space-hint';
        spaceHintElement.textContent = 'Press SPACE to start';
        spaceHintElement.style.position = 'fixed';
        spaceHintElement.style.color = 'var(--accent)';
        spaceHintElement.style.fontSize = '14px';
        spaceHintElement.style.fontFamily = "'Courier New', monospace";
        spaceHintElement.style.textShadow = '0 0 8px var(--accent)';
        spaceHintElement.style.zIndex = '10003';
        spaceHintElement.style.pointerEvents = 'none';
        spaceHintElement.style.fontWeight = 'bold';
        spaceHintElement.style.opacity = '1';
        spaceHintElement.style.animation = 'blink 1.5s infinite';
        spaceHintElement.style.textAlign = 'center';
        spaceHintElement.style.whiteSpace = 'nowrap';
        document.body.appendChild(spaceHintElement);
    }
    
    // Create game footer with divider and info
    gameFooterElement = document.createElement('div');
    gameFooterElement.id = 'game-footer';
    gameFooterElement.style.position = 'fixed';
    gameFooterElement.style.left = contentRect.left + 'px';
    if (isMobile) {
        // On mobile: footer at the very bottom
        gameFooterElement.style.bottom = '0px';
    } else {
        // On desktop: footer 60px from bottom
        gameFooterElement.style.bottom = contentRect.bottom - 60 + 'px';
    }
    gameFooterElement.style.width = contentRect.width + 'px';
    gameFooterElement.style.height = '60px';
    gameFooterElement.style.color = 'var(--text)';
    gameFooterElement.style.fontSize = '11px';
    gameFooterElement.style.fontFamily = "'Courier New', monospace";
    gameFooterElement.style.textShadow = '0 0 3px var(--accent)';
    gameFooterElement.style.zIndex = '10002';
    gameFooterElement.style.pointerEvents = 'none';
    gameFooterElement.style.display = 'flex';
    gameFooterElement.style.flexDirection = 'column';
    gameFooterElement.style.backgroundColor = 'transparent';
    document.body.appendChild(gameFooterElement);
    
    // Create mobile control buttons (only on mobile devices)
    if (isMobile) {
        // Left button
        mobileControlLeft = document.createElement('button');
        mobileControlLeft.id = 'mobile-control-left';
        mobileControlLeft.textContent = '◄';
        mobileControlLeft.style.position = 'fixed';
        mobileControlLeft.style.left = '20px';
        mobileControlLeft.style.bottom = '20px';
        mobileControlLeft.style.width = '50px';
        mobileControlLeft.style.height = '50px';
        mobileControlLeft.style.borderRadius = '4px';
        mobileControlLeft.style.border = '2px solid var(--accent)';
        mobileControlLeft.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        mobileControlLeft.style.color = 'var(--accent)';
        mobileControlLeft.style.fontSize = '24px';
        mobileControlLeft.style.fontFamily = 'monospace';
        mobileControlLeft.style.textShadow = '0 0 5px var(--accent)';
        mobileControlLeft.style.cursor = 'pointer';
        mobileControlLeft.style.zIndex = '10005';
        mobileControlLeft.style.userSelect = 'none';
        mobileControlLeft.style.touchAction = 'manipulation';
        mobileControlLeft.style.boxShadow = '0 0 10px var(--accent)';
        document.body.appendChild(mobileControlLeft);
        
        // Right button
        mobileControlRight = document.createElement('button');
        mobileControlRight.id = 'mobile-control-right';
        mobileControlRight.textContent = '►';
        mobileControlRight.style.position = 'fixed';
        mobileControlRight.style.right = '20px';
        mobileControlRight.style.bottom = '20px';
        mobileControlRight.style.width = '50px';
        mobileControlRight.style.height = '50px';
        mobileControlRight.style.borderRadius = '4px';
        mobileControlRight.style.border = '2px solid var(--accent)';
        mobileControlRight.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        mobileControlRight.style.color = 'var(--accent)';
        mobileControlRight.style.fontSize = '24px';
        mobileControlRight.style.fontFamily = 'monospace';
        mobileControlRight.style.textShadow = '0 0 5px var(--accent)';
        mobileControlRight.style.cursor = 'pointer';
        mobileControlRight.style.zIndex = '10005';
        mobileControlRight.style.userSelect = 'none';
        mobileControlRight.style.touchAction = 'manipulation';
        mobileControlRight.style.boxShadow = '0 0 10px var(--accent)';
        document.body.appendChild(mobileControlRight);
        
        // Touch event handlers
        const handleTouchStart = (direction) => (e) => {
            e.preventDefault();
            paddle.dx = direction * paddle.speed;
        };
        
        const handleTouchEnd = (e) => {
            e.preventDefault();
            paddle.dx = 0;
        };
        
        mobileControlLeft.addEventListener('touchstart', handleTouchStart(-1), { passive: false });
        mobileControlLeft.addEventListener('touchend', handleTouchEnd, { passive: false });
        mobileControlLeft.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        mobileControlRight.addEventListener('touchstart', handleTouchStart(1), { passive: false });
        mobileControlRight.addEventListener('touchend', handleTouchEnd, { passive: false });
        mobileControlRight.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        
        // Mouse events for testing on desktop
        mobileControlLeft.addEventListener('mousedown', handleTouchStart(-1));
        mobileControlLeft.addEventListener('mouseup', handleTouchEnd);
        mobileControlLeft.addEventListener('mouseleave', handleTouchEnd);
        mobileControlRight.addEventListener('mousedown', handleTouchStart(1));
        mobileControlRight.addEventListener('mouseup', handleTouchEnd);
        mobileControlRight.addEventListener('mouseleave', handleTouchEnd);
    }
    
    // Create divider line (ASCII style)
    const divider = document.createElement('div');
    divider.style.width = '100%';
    divider.style.height = 'auto';
    divider.style.color = 'var(--accent)';
    divider.style.textAlign = 'left';
    divider.style.fontSize = '12px';
    divider.style.lineHeight = '1';
    divider.style.marginBottom = '5px';
    divider.style.textShadow = '0 0 5px var(--accent)';
    divider.style.fontFamily = 'monospace';
    divider.style.letterSpacing = '-1px';
    divider.style.overflow = 'hidden';
    divider.style.whiteSpace = 'nowrap';
    divider.textContent = '━'.repeat(Math.floor(contentRect.width / 7));
    gameFooterElement.appendChild(divider);
    
    // Create info container with three columns
    scoreElement = document.createElement('div');
    scoreElement.id = 'game-score-display';
    scoreElement.style.display = 'flex';
    scoreElement.style.justifyContent = 'space-between';
    scoreElement.style.padding = '5px 20px';
    scoreElement.style.alignItems = 'center';
    scoreElement.style.flex = '1';
    scoreElement.innerHTML = `
        <div style="text-align: left; flex: 1;">
            <div id="game-player">Player: ${playerName || 'Player'}</div>
            <div id="game-lives">Lives: 3</div>
            <div id="game-score">Score: 0</div>
            <div id="game-speed">Speed: 1.0x</div>
        </div>
        <div style="text-align: center; flex: 1; font-size: 10px; line-height: 1.3;">
            <div>← → / Mouse: Move</div>
            <div>SPACE: Launch</div>
        </div>
        <div style="text-align: right; flex: 1; font-size: 10px; line-height: 1.3;">
            <div>R: Restart</div>
            <div>Q: Quit</div>
            <div>+/-: Speed</div>
        </div>
    `;
    gameFooterElement.appendChild(scoreElement);
    
    // Initialize game objects (relative coordinates)
    // Paddle positioned low, just above the footer
    if (isMobile) {
        // On mobile: paddle above footer (60px footer + 20px margin = 80px from bottom)
        paddle = {
            x: gameWidth / 2 - 60,
            y: gameHeight - 80,
            width: 120,
            height: 20,
            speed: 8,
            dx: 0
        };
        
        ball = {
            x: gameWidth / 2,
            y: gameHeight - 100, // Ball starts on paddle
            radius: 10,
            dx: 0,
            dy: 0,
            speed: 3
        };
    } else {
        // On desktop: paddle positioned low, just above the footer (70px = 60px footer + 10px margin)
        paddle = {
            x: gameWidth / 2 - 60,
            y: gameHeight - 75,
            width: 120,
            height: 20,
            speed: 8,
            dx: 0
        };
        
        ball = {
            x: gameWidth / 2,
            y: gameHeight - 95, // Ball starts on paddle
            radius: 10,
            dx: 0,
            dy: 0,
            speed: 3
        };
    }
    
        ballLaunched = false;
        ballLaunchFrame = 0;
        score = 0;
        lives = 3;
        gameSpeed = 1.0; // Reset speed to normal
        
        // Note: createTextBlocks() is now called separately after scroll completes
        
        // Update display
        updateGameDisplay();
        
        console.log('prepareGame: Game preparation completed successfully');
    } catch (error) {
        console.error('prepareGame: Error during game preparation:', error);
        if (typeof appendOutput !== 'undefined') {
            appendOutput('Error preparing game: ' + error.message);
        }
    }
}

function startGame() {
    try {
        console.log('startGame: Starting game...');
        
        if (gameRunning) {
            console.log('startGame: Game already running');
            return;
        }
        
        // Safety check - ensure we have blocks to destroy
        if (fishBlocks.length === 0) {
            console.error('startGame: Cannot start game - no fish blocks created!');
            if (typeof appendOutput !== 'undefined') {
                appendOutput('Error: No game blocks available. Please try restarting the game.');
            }
            return;
        }
        
        gameRunning = true;
        const monitorContent = document.querySelector('.monitor-content');
        
        if (!monitorContent) {
            console.error('startGame: monitor-content not found');
            gameRunning = false;
            return;
        }
        
        // Remove space prompt
        const spacePrompt = document.getElementById('game-space-prompt');
        if (spacePrompt) spacePrompt.remove();
        
        // Hide tap to start button if exists (don't remove, just hide for potential restart)
        if (tapToStartButton) {
            tapToStartButton.style.display = 'none';
        }
        
        // Check if mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        // On mobile: hide monitor header and footer for full game screen
        if (isMobile) {
            const monitorHeader = document.querySelector('.monitor-header');
            const monitorFooter = document.querySelector('.monitor-footer');
            if (monitorHeader) {
                monitorHeader.style.display = 'none';
                console.log('Mobile: Hidden monitor header');
            }
            if (monitorFooter) {
                monitorFooter.style.display = 'none';
                console.log('Mobile: Hidden monitor footer');
            }
        }
        
        // Scroll to show fish near top (especially important on mobile)
        const fishArt = document.getElementById('fish-art');
        if (fishArt) {
            setTimeout(() => {
                if (isMobile) {
                    // On mobile: scroll fish to the very top
                    monitorContent.scrollTop = 0;
                    console.log('Game started on mobile, scrolled to top');
                } else {
                    // On desktop: scroll fish near top with small margin
                    const scrollTarget = fishArt.offsetTop - 20;
                    monitorContent.scrollTop = scrollTarget;
                    console.log('Game started, scrolled to:', scrollTarget);
                }
            }, 100);
        }
        
        // Event listeners
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        monitorContent.addEventListener('mousemove', mouseMoveHandler);
        
        // Start game loop
        gameLoop();
        
        console.log('startGame: Game started successfully');
    } catch (error) {
        console.error('startGame: Error starting game:', error);
        gameRunning = false;
        if (typeof appendOutput !== 'undefined') {
            appendOutput('Error starting game: ' + error.message);
        }
    }
}

function createTextBlocks() {
    try {
        console.log('createTextBlocks: Starting block creation...');
        fishBlocks = [];
        
        const monitorContent = document.querySelector('.monitor-content');
        if (!monitorContent) {
            console.error('createTextBlocks: monitor-content not found');
            return;
        }
        
        const contentRect = monitorContent.getBoundingClientRect();
        
        // Character dimensions
        const charWidth = 8.4;
        const charHeight = 16;
        
        // Get fish element by ID
        const fishElement = document.getElementById('fish-art');
        
        // Enhanced element checks
        if (!fishElement) {
            console.error('createTextBlocks: fish-art element not found');
            return;
        }
        
        // Check if element is visible and has proper dimensions
        if (fishElement.offsetParent === null) {
            console.warn('createTextBlocks: fish-art element is not visible (offsetParent is null)');
            return;
        }
        
        const rect = fishElement.getBoundingClientRect();
        
        // Check if element has valid dimensions
        if (rect.width === 0 || rect.height === 0) {
            console.warn('createTextBlocks: fish-art element has zero dimensions', rect);
            return;
        }
        
        console.log('createTextBlocks: Fish element found and visible', {
            rect: rect,
            offsetParent: fishElement.offsetParent,
            innerHTML: fishElement.innerHTML.substring(0, 100) + '...'
        });
        
        // First, try to get original text from data attribute (from previous game run)
        let text = fishElement.getAttribute('data-original-text');
        
        if (!text) {
            // Check if we have game blocks already (spans with game structure)
            const hasGameBlocks = fishElement.querySelector('div') !== null;
            
            if (hasGameBlocks) {
                // Reconstruct from game block structure
                console.log('createTextBlocks: Reconstructing from game block structure');
                const lines = Array.from(fishElement.children);
                text = lines.map(line => {
                    const spans = Array.from(line.querySelectorAll('span'));
                    return spans.map(span => span.textContent).join('');
                }).join('\n');
            } else {
                // Get text content directly (typeText just finished)
                console.log('createTextBlocks: Getting text from typeText output');
                // Remove cursor element if present
                const cursor = fishElement.querySelector('.typing-cursor');
                if (cursor) {
                    cursor.remove();
                    console.log('createTextBlocks: Removed typing cursor');
                }
                
                text = fishElement.textContent;
                
                // Store original text for future use
                if (text && text.trim().length > 0) {
                    fishElement.setAttribute('data-original-text', text);
                    console.log('createTextBlocks: Stored original text');
                }
            }
            
            console.log('createTextBlocks: Retrieved text, length:', text ? text.length : 0);
        } else {
            console.log('createTextBlocks: Using stored original text, length:', text.length);
        }
        
        if (!text || text.trim().length === 0) {
            console.error('createTextBlocks: fish art text is empty or invalid');
            console.error('createTextBlocks: fishElement.innerHTML:', fishElement.innerHTML);
            console.error('createTextBlocks: fishElement.textContent:', fishElement.textContent);
            return;
        }
        
        const lines = text.split('\n');
        console.log('createTextBlocks: Processing', lines.length, 'lines');
        
        const relativeX = rect.left - contentRect.left;
        const relativeY = rect.top - contentRect.top + monitorContent.scrollTop;
        
        // Clear and rebuild fish element with spans
        fishElement.innerHTML = '';
        
        let blockCount = 0;
        lines.forEach((line, lineIndex) => {
            const lineDiv = document.createElement('div');
            lineDiv.style.whiteSpace = 'pre';
            lineDiv.style.margin = '0';
            lineDiv.style.padding = '0';
            lineDiv.style.lineHeight = '1.1';
            
            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                const charSpan = document.createElement('span');
                charSpan.textContent = char || ' ';
                charSpan.style.display = 'inline-block';
                charSpan.style.width = charWidth + 'px';
                charSpan.style.visibility = 'visible'; // Ensure visible on creation
                lineDiv.appendChild(charSpan);
                
                if (char.trim()) {
                    const blockY = relativeY + lineIndex * charHeight;
                    
                    // Create blocks for all visible characters in the fish art
                    // Don't filter by position - let the game handle all blocks
                    fishBlocks.push({
                        x: relativeX + charIndex * charWidth,
                        y: blockY,
                        width: charWidth,
                        height: charHeight,
                        active: true,
                        char: char,
                        element: charSpan
                    });
                    blockCount++;
                }
            }
            
            fishElement.appendChild(lineDiv);
        });
        
        console.log('createTextBlocks: Successfully created', blockCount, 'blocks');
    } catch (error) {
        console.error('createTextBlocks: Error creating blocks:', error);
        fishBlocks = [];
    }
}

function updateSpeedDisplay() {
    const speedDisplay = document.getElementById('game-speed');
    if (speedDisplay) {
        speedDisplay.textContent = `Speed: ${gameSpeed.toFixed(1)}x`;
    }
}

function updateGameDisplay() {
    const monitorContent = document.querySelector('.monitor-content');
    const rect = monitorContent.getBoundingClientRect();
    
    // Update paddle position
    if (paddleElement) {
        paddleElement.style.left = (rect.left + paddle.x) + 'px';
        paddleElement.style.top = (rect.top + paddle.y) + 'px';
    }
    
    // Update ball position
    if (ballElement) {
        ballElement.style.left = (rect.left + ball.x - 10) + 'px';
        ballElement.style.top = (rect.top + ball.y - 10) + 'px';
    }
    
    // Update and position "Press SPACE to start" hint (desktop) or "Tap to start" button (mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile && tapToStartButton) {
        if (!ballLaunched && gameWaitingForStart) {
            // Show button centered in the game area
            tapToStartButton.style.display = 'block';
            tapToStartButton.style.left = (rect.left + rect.width / 2) + 'px';
            tapToStartButton.style.top = (rect.top + rect.height / 2) + 'px';
            tapToStartButton.style.transform = 'translate(-50%, -50%)';
        } else {
            // Hide button when ball is launched
            tapToStartButton.style.display = 'none';
        }
    } else if (spaceHintElement) {
        if (!ballLaunched) {
            // Show hint centered in the game area
            spaceHintElement.style.display = 'block';
            spaceHintElement.style.left = (rect.left + rect.width / 2) + 'px';
            spaceHintElement.style.top = (rect.top + rect.height / 2) + 'px';
            spaceHintElement.style.transform = 'translate(-50%, -50%)';
        } else {
            // Hide hint when ball is launched
            spaceHintElement.style.display = 'none';
        }
    }
    
    // Update score and lives in footer
    const playerElement = document.getElementById('game-player');
    const livesElement = document.getElementById('game-lives');
    const scoreDisplay = document.getElementById('game-score');
    const speedDisplay = document.getElementById('game-speed');
    if (playerElement) {
        playerElement.textContent = `Player: ${playerName || 'Player'}`;
    }
    if (livesElement) {
        livesElement.textContent = `Lives: ${lives}`;
    }
    if (scoreDisplay) {
        const activeBlocks = fishBlocks.filter(b => b.active).length;
        scoreDisplay.textContent = `Score: ${score} | Blocks: ${activeBlocks}`;
    }
    if (speedDisplay) {
        speedDisplay.textContent = `Speed: ${gameSpeed.toFixed(1)}x`;
    }
    
    // Hide hit fish characters
    fishBlocks.forEach(block => {
        if (!block.active && block.element) {
            block.element.style.visibility = 'hidden';
        }
    });
}

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    } else if (e.key === ' ' && !ballLaunched) {
        // Launch ball
        e.preventDefault();
        // Ensure ball is on paddle before launch
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
        ballLaunched = true;
        ballLaunchFrame = 0; // Reset frame counter
        ball.dx = 2 * gameSpeed;
        ball.dy = -4 * gameSpeed;
    } else if (e.key === '+' || e.key === '=') {
        // Increase game speed
        e.preventDefault();
        gameSpeed = Math.min(gameSpeed + 0.2, 3.0); // Max 3x speed
        updateSpeedDisplay();
    } else if (e.key === '-' || e.key === '_') {
        // Decrease game speed
        e.preventDefault();
        gameSpeed = Math.max(gameSpeed - 0.2, 0.3); // Min 0.3x speed
        updateSpeedDisplay();
    } else if (e.key === 'r' || e.key === 'R') {
        // Restart game at any time
        e.preventDefault();
        restartGameFromPlay();
    } else if (e.key === 'q' || e.key === 'Q') {
        // Quit game
        e.preventDefault();
        endGame();
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || 
        e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }
}

function mouseMoveHandler(e) {
    const monitorContent = document.querySelector('.monitor-content');
    const rect = monitorContent.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - paddle.width / 2;
    
    // Keep paddle in bounds
    const gameWidth = rect.width;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > gameWidth) {
        paddle.x = gameWidth - paddle.width;
    }
}

function update() {
    const monitorContent = document.querySelector('.monitor-content');
    const rect = monitorContent.getBoundingClientRect();
    const gameWidth = rect.width;
    const gameHeight = rect.height;
    // Move paddle
    paddle.x += paddle.dx;
    
    // Keep paddle in bounds
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > gameWidth) {
        paddle.x = gameWidth - paddle.width;
    }
    
    // If ball not launched, keep it on paddle
    if (!ballLaunched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    } else {
        // Move ball (apply speed multiplier)
        ball.x += ball.dx * gameSpeed;
        ball.y += ball.dy * gameSpeed;
    }
    
    // Ball collision with walls (only if launched)
    if (ballLaunched) {
        if (ball.x + ball.radius > gameWidth || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
        }
        
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }
    }
    
    // Ball collision with paddle (only if launched)
    if (ballLaunched && ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 4 * gameSpeed;
    }
    
    // Ball falls below paddle - lose life (only if launched)
    // Check that ball fell below paddle
    // Protection: don't check in first 10 frames after launch to avoid false triggers
    if (ballLaunched && ballLaunchFrame > 10 && ball.dy > 0 && ball.y + ball.radius > paddle.y + paddle.height) {
        lives--;
        if (lives > 0) {
            // Reset ball on paddle
            ballLaunched = false;
            ballLaunchFrame = 0;
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius;
            ball.dx = 0;
            ball.dy = 0;
        } else {
            // Game over
            endGame();
            return;
        }
    }
    
    // Increment frame counter after ball launch
    if (ballLaunched) {
        ballLaunchFrame++;
    }
    
    // Ball collision with fish blocks (only if launched)
    if (ballLaunched) {
        fishBlocks.forEach(block => {
            if (!block.active) return;
            
            if (ball.x + ball.radius > block.x &&
                ball.x - ball.radius < block.x + block.width &&
                ball.y + ball.radius > block.y &&
                ball.y - ball.radius < block.y + block.height) {
                
                ball.dy = -ball.dy;
                block.active = false;
                score += 1;
            }
        });
        
        // Check win condition
        const activeBlocks = fishBlocks.filter(b => b.active).length;
        if (activeBlocks === 0) {
            winGame();
            return;
        }
    }
    
    // Update visual display
    updateGameDisplay();
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    
    gameAnimationId = requestAnimationFrame(gameLoop);
}

function restartGameFromPlay() {
    // Stop current game
    gameRunning = false;
    ballLaunched = false;
    ballLaunchFrame = 0;
    cancelAnimationFrame(gameAnimationId);
    
    // Remove event listeners
    const monitorContent = document.querySelector('.monitor-content');
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    monitorContent.removeEventListener('mousemove', mouseMoveHandler);
    
    // Clean up game elements
    if (paddleElement) { paddleElement.remove(); paddleElement = null; }
    if (ballElement) { ballElement.remove(); ballElement = null; }
    if (spaceHintElement) { spaceHintElement.remove(); spaceHintElement = null; }
    if (tapToStartButton) { tapToStartButton.remove(); tapToStartButton = null; }
    if (gameFooterElement) { gameFooterElement.remove(); gameFooterElement = null; }
    scoreElement = null;
    
    // Reset score and lives
    score = 0;
    lives = 3;
    
    // Prepare and start new game
    prepareGame();
    
    // Create blocks after a small delay to ensure proper positioning
    setTimeout(() => {
        createTextBlocks();
        startGame();
    }, 100);
}

function endGame() {
    gameRunning = false;
    ballLaunched = false;
    ballLaunchFrame = 0;
    cancelAnimationFrame(gameAnimationId);
    
    // Remove event listeners
    const monitorContent = document.querySelector('.monitor-content');
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    monitorContent.removeEventListener('mousemove', mouseMoveHandler);
    
    // Clean up game elements
    if (paddleElement) { paddleElement.remove(); paddleElement = null; }
    if (ballElement) { ballElement.remove(); ballElement = null; }
    if (spaceHintElement) { spaceHintElement.remove(); spaceHintElement = null; }
    if (tapToStartButton) { tapToStartButton.remove(); tapToStartButton = null; }
    if (gameFooterElement) { gameFooterElement.remove(); gameFooterElement = null; }
    if (mobileControlLeft) { mobileControlLeft.remove(); mobileControlLeft = null; }
    if (mobileControlRight) { mobileControlRight.remove(); mobileControlRight = null; }
    scoreElement = null;
    
    // Remove fish blocks
    fishBlocks.forEach(block => {
        if (block.element && block.element.parentNode) {
            block.element.remove();
        }
    });
    fishBlocks = [];
    
    // Restore monitor header and footer on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
        const monitorHeader = document.querySelector('.monitor-header');
        const monitorFooter = document.querySelector('.monitor-footer');
        if (monitorHeader) {
            monitorHeader.style.display = '';
            console.log('Mobile: Restored monitor header');
        }
        if (monitorFooter) {
            monitorFooter.style.display = '';
            console.log('Mobile: Restored monitor footer');
        }
    }
    
    // Show terminal input line
    const inputLine = document.getElementById('terminal-input-line');
    if (inputLine) {
        inputLine.style.display = 'flex';
    }
    
    // Output game over message to terminal
    appendOutput('');
    appendOutput('');
    appendOutput('╔═══════════════════════════════════════════════╗');
    appendOutput('║                                               ║');
    appendOutput('║              G A M E   O V E R                ║');
    appendOutput('║                                               ║');
    appendOutput(`║              Player: ${(playerName || 'Player').padEnd(30)} ║`);
    appendOutput(`║              Final Score: ${score.toString().padStart(4, ' ')}               ║`);
    appendOutput('║                                               ║');
    appendOutput('╚═══════════════════════════════════════════════╝');
    appendOutput('');
    appendOutput('Type "r" to restart or "q" to exit');
    appendOutput('');
    
    // Set up game over input handler
    window.waitingForGameResponse = true;
    const originalHandleGameResponse = window.handleGameResponse;
    
    window.handleGameResponse = function(response) {
        const trimmed = response.trim().toLowerCase();
        
        if (trimmed === 'r' || trimmed === 'restart') {
            window.waitingForGameResponse = false;
            window.handleGameResponse = originalHandleGameResponse;
            
            appendOutput('$ ' + response, 'terminal-prompt');
            appendOutput('');
            appendOutput('Restarting game...');
            appendOutput('');
            
            score = 0;
            lives = 3;
            gameSpeed = 1.0;
            
            setTimeout(() => {
                showGameInstructions();
            }, 500);
        } else if (trimmed === 'q' || trimmed === 'quit' || trimmed === 'exit') {
            window.waitingForGameResponse = false;
            window.handleGameResponse = originalHandleGameResponse;
            
            appendOutput('$ ' + response, 'terminal-prompt');
            appendOutput('');
            appendOutput('Thanks for playing!');
            appendOutput('');
            
            // Show all terminal output again
            const terminalOutput = document.getElementById('terminal-output');
            Array.from(terminalOutput.children).forEach(child => {
                child.style.display = '';
            });
        } else {
            appendOutput('$ ' + response, 'terminal-prompt');
            appendOutput('');
            appendOutput('Type "r" to restart or "q" to exit');
            appendOutput('');
        }
    };
    
    // Focus on input
    setTimeout(() => {
        const inputEl = document.getElementById('terminal-input');
        if (inputEl) {
            inputEl.focus();
        }
    }, 100);
}

function winGame() {
    gameRunning = false;
    ballLaunched = false;
    ballLaunchFrame = 0;
    cancelAnimationFrame(gameAnimationId);
    
    // Remove event listeners
    const monitorContent = document.querySelector('.monitor-content');
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    monitorContent.removeEventListener('mousemove', mouseMoveHandler);
    
    // Clean up game elements
    if (paddleElement) { paddleElement.remove(); paddleElement = null; }
    if (ballElement) { ballElement.remove(); ballElement = null; }
    if (spaceHintElement) { spaceHintElement.remove(); spaceHintElement = null; }
    if (tapToStartButton) { tapToStartButton.remove(); tapToStartButton = null; }
    if (gameFooterElement) { gameFooterElement.remove(); gameFooterElement = null; }
    if (mobileControlLeft) { mobileControlLeft.remove(); mobileControlLeft = null; }
    if (mobileControlRight) { mobileControlRight.remove(); mobileControlRight = null; }
    scoreElement = null;
    
    // Remove fish blocks
    fishBlocks.forEach(block => {
        if (block.element && block.element.parentNode) {
            block.element.remove();
        }
    });
    fishBlocks = [];
    
    // Restore monitor header and footer on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
        const monitorHeader = document.querySelector('.monitor-header');
        const monitorFooter = document.querySelector('.monitor-footer');
        if (monitorHeader) {
            monitorHeader.style.display = '';
            console.log('Mobile: Restored monitor header');
        }
        if (monitorFooter) {
            monitorFooter.style.display = '';
            console.log('Mobile: Restored monitor footer');
        }
    }
    
    // Show terminal input line
    const inputLine = document.getElementById('terminal-input-line');
    if (inputLine) {
        inputLine.style.display = 'flex';
    }
    
    // Output victory message to terminal
    appendOutput('');
    appendOutput('');
    appendOutput('╔═══════════════════════════════════════════════╗');
    appendOutput('║                                               ║');
    appendOutput('║         F I S H   D E S T R O Y E D !         ║');
    appendOutput('║                                               ║');
    appendOutput(`║              Player: ${(playerName || 'Player').padEnd(30)} ║`);
    appendOutput(`║              Final Score: ${score.toString().padStart(4, ' ')}               ║`);
    appendOutput('║                                               ║');
    appendOutput('║              *** VICTORY! ***                 ║');
    appendOutput('║                                               ║');
    appendOutput('╚═══════════════════════════════════════════════╝');
    appendOutput('');
    appendOutput('Type "r" to restart or "q" to exit');
    appendOutput('');
    
    // Set up game over input handler
    window.waitingForGameResponse = true;
    const originalHandleGameResponse = window.handleGameResponse;
    
    window.handleGameResponse = function(response) {
        const trimmed = response.trim().toLowerCase();
        
        if (trimmed === 'r' || trimmed === 'restart') {
            window.waitingForGameResponse = false;
            window.handleGameResponse = originalHandleGameResponse;
            
            appendOutput('$ ' + response, 'terminal-prompt');
            appendOutput('');
            appendOutput('Restarting game...');
            appendOutput('');
            
            score = 0;
            lives = 3;
            gameSpeed = 1.0;
            
            setTimeout(() => {
                showGameInstructions();
            }, 500);
        } else if (trimmed === 'q' || trimmed === 'quit' || trimmed === 'exit') {
            window.waitingForGameResponse = false;
            window.handleGameResponse = originalHandleGameResponse;
            
            appendOutput('$ ' + response, 'terminal-prompt');
            appendOutput('');
            appendOutput('Thanks for playing!');
            appendOutput('');
            
            // Show all terminal output again
            const terminalOutput = document.getElementById('terminal-output');
            Array.from(terminalOutput.children).forEach(child => {
                child.style.display = '';
            });
        } else {
            appendOutput('$ ' + response, 'terminal-prompt');
            appendOutput('');
            appendOutput('Type "r" to restart or "q" to exit');
            appendOutput('');
        }
    };
    
    // Focus on input
    setTimeout(() => {
        const inputEl = document.getElementById('terminal-input');
        if (inputEl) {
            inputEl.focus();
        }
    }, 100);
}

function resetGame() {
    gameRunning = false;
    ballLaunched = false;
    ballLaunchFrame = 0;
    cancelAnimationFrame(gameAnimationId);
    
    // Remove game elements
    if (paddleElement) {
        paddleElement.remove();
        paddleElement = null;
    }
    if (ballElement) {
        ballElement.remove();
        ballElement = null;
    }
    if (spaceHintElement) {
        spaceHintElement.remove();
        spaceHintElement = null;
    }
    if (tapToStartButton) {
        tapToStartButton.remove();
        tapToStartButton = null;
    }
    if (gameFooterElement) {
        gameFooterElement.remove();
        gameFooterElement = null;
    }
    if (mobileControlLeft) { mobileControlLeft.remove(); mobileControlLeft = null; }
    if (mobileControlRight) { mobileControlRight.remove(); mobileControlRight = null; }
    scoreElement = null;
    
    // Remove game over/win messages
    const gameOverMsg = document.getElementById('game-over-message');
    if (gameOverMsg) gameOverMsg.remove();
    const winMsg = document.getElementById('game-win-message');
    if (winMsg) winMsg.remove();
    
    // Show all terminal output again
    const terminalOutput = document.getElementById('terminal-output');
    Array.from(terminalOutput.children).forEach(child => {
        child.style.display = '';
    });
    
    // Restore fish visibility for all characters
    fishBlocks.forEach(block => {
        block.active = true;
        if (block.element) {
            block.element.style.visibility = 'visible';
        }
    });
    
    // Restore monitor header and footer on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
        const monitorHeader = document.querySelector('.monitor-header');
        const monitorFooter = document.querySelector('.monitor-footer');
        if (monitorHeader) {
            monitorHeader.style.display = '';
        }
        if (monitorFooter) {
            monitorFooter.style.display = '';
        }
    }
    
    // Show terminal input line
    document.getElementById('terminal-input-line').style.display = 'flex';
    
    // Reset score and lives
    score = 0;
    lives = 3;
    
    // Focus back on terminal
    if (terminalReady) {
        document.getElementById('terminal-input').focus();
    }
}


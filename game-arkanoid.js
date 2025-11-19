// Arkanoid Game Module

// Game state variables
let gameRunning = false;
let gameWaitingForStart = false;
let ballLaunched = false;
let ballLaunchFrame = 0; // Frame counter since ball launch
let paddle, ball, fishBlocks = [];
let score = 0;
let lives = 3;
let gameAnimationId;
let paddleElement, ballElement, scoreElement, gameFooterElement, spaceHintElement;
let gameSpeed = 1.0; // Speed multiplier for game (1.0 = normal speed)
let playerName = '';
let waitingForPlayerName = false;
window.waitingForPlayerName = false; // Make it global for access from index.html
let mobileControlLeft, mobileControlRight;

function waitForGameStart() {
    waitingForGameResponse = true;
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
    // Save original response for output
    const originalResponse = response;
    const trimmedResponse = response.trim().toLowerCase();
    
    if (waitingForPlayerName) {
        // Handle player name input
        playerName = originalResponse.trim() || 'Player';
        waitingForPlayerName = false;
        window.waitingForPlayerName = false;
        appendOutput('$ ' + originalResponse, 'terminal-prompt');
        appendOutput('');
        appendOutput(`Welcome, ${playerName}!`);
        appendOutput('');
        // Force scroll to bottom
        setTimeout(() => {
            const monitorContent = document.querySelector('.monitor-content');
            if (monitorContent) {
                monitorContent.scrollTop = monitorContent.scrollHeight;
            }
        }, 100);
        showGameInstructions();
        return;
    }
    
    if (trimmedResponse === 'y' || trimmedResponse === 'yes') {
        waitingForGameResponse = false;
        appendOutput('$ ' + originalResponse, 'terminal-prompt');
        appendOutput('');
        // Request player name
        waitingForPlayerName = true;
        window.waitingForPlayerName = true;
        appendOutput('Enter your name:');
        appendOutput('');
        // Force scroll to bottom
        setTimeout(() => {
            const monitorContent = document.querySelector('.monitor-content');
            if (monitorContent) {
                monitorContent.scrollTop = monitorContent.scrollHeight;
            }
            const inputEl = document.getElementById('terminal-input');
            if (inputEl) {
                inputEl.focus();
            }
        }, 100);
    } else if (trimmedResponse === 'n' || trimmedResponse === 'no') {
        waitingForGameResponse = false;
        appendOutput('$ ' + originalResponse, 'terminal-prompt');
        appendOutput('');
        appendOutput('Game cancelled.');
        appendOutput('');
        // Force scroll to bottom
        setTimeout(() => {
            const monitorContent = document.querySelector('.monitor-content');
            if (monitorContent) {
                monitorContent.scrollTop = monitorContent.scrollHeight;
            }
        }, 100);
    } else {
        // Invalid answer - keep waitingForGameResponse = true
        appendOutput('$ ' + originalResponse, 'terminal-prompt');
        appendOutput('');
        appendOutput('Please answer y or n');
        appendOutput('');
        // Force scroll to bottom
        setTimeout(() => {
            const monitorContent = document.querySelector('.monitor-content');
            if (monitorContent) {
                monitorContent.scrollTop = monitorContent.scrollHeight;
            }
            // Ensure input prompt remains visible
            const inputEl = document.getElementById('terminal-input');
            if (inputEl) {
                inputEl.focus();
            }
        }, 100);
    }
}

function showGameInstructions() {
    appendOutput('');
    
    // Show fish art immediately at top
    const outputEl = document.getElementById('terminal-output');
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
    
    typeText(SiteTexts.commands.game.fishArt, artDiv, () => {
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
            // Scroll to fish art position - ensure fish is visible at top
            const scrollTarget = artDiv.offsetTop - 20;
            monitorContent.scrollTop = scrollTarget;
            console.log('Scrolled to:', scrollTarget, 'Fish offset:', artDiv.offsetTop);
        }, 150);
        
        // Wait for DOM update before initializing game
        setTimeout(() => {
            // Set flag BEFORE preparing game
            gameWaitingForStart = true;
            
            // Initialize game setup (but don't start yet)
            prepareGame();
            
            // Create blocks AFTER scroll has completed
            setTimeout(() => {
                createTextBlocks();
                
                // Verify blocks were created
                if (fishBlocks.length === 0) {
                    console.error('No fish blocks created! Retrying...');
                    // Retry block creation
                    createTextBlocks();
                }
                
                console.log('Fish blocks created:', fishBlocks.length);
                console.log('Waiting for spacebar, gameWaitingForStart:', gameWaitingForStart);
            }, 200);
            
            // Wait for spacebar to start
            waitForSpaceToStart();
        }, 300);
    }, 3);
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
    const monitorContent = document.querySelector('.monitor-content');
    const contentRect = monitorContent.getBoundingClientRect();
    const gameWidth = contentRect.width;
    const gameHeight = contentRect.height;
    
    // Hide terminal input
    document.getElementById('terminal-input-line').style.display = 'none';
    
    // Hide all terminal output except fish
    const terminalOutput = document.getElementById('terminal-output');
    Array.from(terminalOutput.children).forEach(child => {
        if (child.id !== 'fish-art') {
            child.style.display = 'none';
        }
    });
    
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
    
    // Create "Press SPACE to start" hint
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
    
    // Create game footer with divider and info
    gameFooterElement = document.createElement('div');
    gameFooterElement.id = 'game-footer';
    gameFooterElement.style.position = 'fixed';
    gameFooterElement.style.left = contentRect.left + 'px';
    gameFooterElement.style.bottom = contentRect.bottom - 60 + 'px'; // 60px from bottom
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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile) {
        // Left button
        mobileControlLeft = document.createElement('button');
        mobileControlLeft.id = 'mobile-control-left';
        mobileControlLeft.textContent = '←';
        mobileControlLeft.style.position = 'fixed';
        mobileControlLeft.style.left = '20px';
        mobileControlLeft.style.bottom = '20px';
        mobileControlLeft.style.width = '60px';
        mobileControlLeft.style.height = '60px';
        mobileControlLeft.style.borderRadius = '50%';
        mobileControlLeft.style.border = '2px solid var(--accent)';
        mobileControlLeft.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        mobileControlLeft.style.color = 'var(--accent)';
        mobileControlLeft.style.fontSize = '24px';
        mobileControlLeft.style.fontFamily = 'monospace';
        mobileControlLeft.style.textShadow = '0 0 10px var(--accent)';
        mobileControlLeft.style.cursor = 'pointer';
        mobileControlLeft.style.zIndex = '10005';
        mobileControlLeft.style.userSelect = 'none';
        mobileControlLeft.style.touchAction = 'manipulation';
        mobileControlLeft.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        document.body.appendChild(mobileControlLeft);
        
        // Right button
        mobileControlRight = document.createElement('button');
        mobileControlRight.id = 'mobile-control-right';
        mobileControlRight.textContent = '→';
        mobileControlRight.style.position = 'fixed';
        mobileControlRight.style.right = '20px';
        mobileControlRight.style.bottom = '20px';
        mobileControlRight.style.width = '60px';
        mobileControlRight.style.height = '60px';
        mobileControlRight.style.borderRadius = '50%';
        mobileControlRight.style.border = '2px solid var(--accent)';
        mobileControlRight.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        mobileControlRight.style.color = 'var(--accent)';
        mobileControlRight.style.fontSize = '24px';
        mobileControlRight.style.fontFamily = 'monospace';
        mobileControlRight.style.textShadow = '0 0 10px var(--accent)';
        mobileControlRight.style.cursor = 'pointer';
        mobileControlRight.style.zIndex = '10005';
        mobileControlRight.style.userSelect = 'none';
        mobileControlRight.style.touchAction = 'manipulation';
        mobileControlRight.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
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
    // Paddle positioned low, just above the footer (70px = 60px footer + 10px margin)
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
    
    ballLaunched = false;
    ballLaunchFrame = 0;
    score = 0;
    lives = 3;
    gameSpeed = 1.0; // Reset speed to normal
    
    // Note: createTextBlocks() is now called separately after scroll completes
    
    // Update display
    updateGameDisplay();
}

function startGame() {
    if (gameRunning) return;
    
    // Safety check - ensure we have blocks to destroy
    if (fishBlocks.length === 0) {
        console.error('Cannot start game - no fish blocks created!');
        return;
    }
    
    gameRunning = true;
    const monitorContent = document.querySelector('.monitor-content');
    
    // Remove space prompt
    const spacePrompt = document.getElementById('game-space-prompt');
    if (spacePrompt) spacePrompt.remove();
    
    // Scroll to show fish near top
    const fishArt = document.getElementById('fish-art');
    if (fishArt) {
        setTimeout(() => {
            const scrollTarget = fishArt.offsetTop - 20;
            monitorContent.scrollTop = scrollTarget;
            console.log('Game started, scrolled to:', scrollTarget);
        }, 100);
    }
    
    // Event listeners
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    monitorContent.addEventListener('mousemove', mouseMoveHandler);
    
    // Start game loop
    gameLoop();
}

function createTextBlocks() {
    fishBlocks = [];
    
    const monitorContent = document.querySelector('.monitor-content');
    const contentRect = monitorContent.getBoundingClientRect();
    
    // Character dimensions
    const charWidth = 8.4;
    const charHeight = 16;
    
    // Get fish element by ID
    const fishElement = document.getElementById('fish-art');
    
    if (fishElement && fishElement.offsetParent !== null) {
        const rect = fishElement.getBoundingClientRect();
        
        // Check if fish is already wrapped in spans (from previous game)
        const hasSpans = fishElement.querySelector('span') !== null;
        let text;
        
        if (hasSpans) {
            // If already has spans, get original text from data attribute or reconstruct
            text = fishElement.getAttribute('data-original-text');
            if (!text) {
                // Reconstruct text from existing structure
                const lines = Array.from(fishElement.children);
                text = lines.map(line => {
                    const spans = Array.from(line.querySelectorAll('span'));
                    return spans.map(span => span.textContent).join('');
                }).join('\n');
            }
        } else {
            // First time - get text content
            text = fishElement.textContent;
            // Store original text
            fishElement.setAttribute('data-original-text', text);
        }
        
        const lines = text.split('\n');
        
        const relativeX = rect.left - contentRect.left;
        const relativeY = rect.top - contentRect.top + monitorContent.scrollTop;
        
        // Clear and rebuild fish element with spans
        fishElement.innerHTML = '';
        
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
                }
            }
            
            fishElement.appendChild(lineDiv);
        });
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
    
    // Update and position "Press SPACE to start" hint
    if (spaceHintElement) {
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
    waitingForGameResponse = true;
    const originalHandleGameResponse = window.handleGameResponse;
    
    window.handleGameResponse = function(response) {
        const trimmed = response.trim().toLowerCase();
        
        if (trimmed === 'r' || trimmed === 'restart') {
            waitingForGameResponse = false;
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
            waitingForGameResponse = false;
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
    waitingForGameResponse = true;
    const originalHandleGameResponse = window.handleGameResponse;
    
    window.handleGameResponse = function(response) {
        const trimmed = response.trim().toLowerCase();
        
        if (trimmed === 'r' || trimmed === 'restart') {
            waitingForGameResponse = false;
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
            waitingForGameResponse = false;
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


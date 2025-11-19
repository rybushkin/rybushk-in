// DOOM Game Module using js-dos
// Note: js-dos works with .jsdos bundles or ZIP archives containing DOOM files
// You need a WAD file (doom1.wad for shareware) and the game executable
// The easiest way: create a .jsdos bundle using https://js-dos.com/games/

let doomRunning = false;
let dosboxInstance = null;
let doomContainer = null;

function startDoom() {
    if (doomRunning) return;
    
    doomRunning = true;
    
    // Hide terminal input
    document.getElementById('terminal-input-line').style.display = 'none';
    
    // Hide terminal output
    const terminalOutput = document.getElementById('terminal-output');
    Array.from(terminalOutput.children).forEach(child => {
        child.style.display = 'none';
    });
    
    // Hide monitor
    const monitor = document.querySelector('.monitor');
    if (monitor) {
        monitor.style.display = 'none';
    }
    
    // Show DOOM container
    doomContainer = document.getElementById('doom-container');
    if (!doomContainer) {
        // Create container if it doesn't exist
        doomContainer = document.createElement('div');
        doomContainer.id = 'doom-container';
        document.body.appendChild(doomContainer);
    }
    doomContainer.style.display = 'block';
    
    // Use online version by default (no file preparation needed!)
    doomContainer.innerHTML = `
        <iframe 
            src="https://dos.zone/player/?bundleUrl=https://dos.zone/games/doom.jsdos&anonymous=1"
            style="width: 100%; height: 100%; border: none; position: fixed; top: 0; left: 0; z-index: 2000;"
            allowfullscreen
            id="doom-iframe">
        </iframe>
    `;
    
    // Add ESC key handler to exit
    const escapeHandler = (e) => {
        if (e.key === 'Escape' && doomRunning) {
            e.preventDefault();
            stopDoom();
        }
    };
    
    document.addEventListener('keydown', escapeHandler);
    doomContainer._escapeHandler = escapeHandler;
    
    return; // Skip DOSBox initialization, use iframe instead
    
    // OLD CODE BELOW - for local file usage (commented out)
    /*
    // Show loading indicator
    doomContainer.innerHTML = `
        <div style="color: var(--accent); font-family: monospace; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 20px;">Loading DOOM...</div>
            <div style="font-size: 14px; opacity: 0.7;">Initializing DOSBox emulator</div>
        </div>
    `;
    
    // Wait for js-dos to load if not already loaded
    function initDoom() {
        if (typeof Dos === 'undefined') {
            // Show error in terminal
            stopDoom();
            const terminalOutput = document.getElementById('terminal-output');
            Array.from(terminalOutput.children).forEach(child => {
                child.style.display = '';
            });
            appendOutput('Error: js-dos library not loaded. Please refresh the page.');
            appendOutput('');
            document.getElementById('terminal-input-line').style.display = 'flex';
            const monitor = document.querySelector('.monitor');
            if (monitor) {
                monitor.style.display = 'flex';
            }
            return;
        }
        
        // Update loading message
        doomContainer.innerHTML = `
            <div style="color: var(--accent); font-family: monospace; text-align: center;">
                <div style="font-size: 24px; margin-bottom: 20px;">Loading DOOM...</div>
                <div style="font-size: 14px; opacity: 0.7;">DOSBox ready, loading game files...</div>
            </div>
        `;
        
        // Clear container after a moment (DOSBox will create its own elements)
        setTimeout(() => {
            doomContainer.innerHTML = '';
        }, 500);
        
        // Initialize DOSBox
        dosboxInstance = Dos(doomContainer, {
            wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js",
            cycles: 10000,
            autolock: true,
            onerror: function(message) {
                console.error('DOSBox error:', message);
                stopDoom();
                const terminalOutput = document.getElementById('terminal-output');
                Array.from(terminalOutput.children).forEach(child => {
                    child.style.display = '';
                });
                appendOutput('Error loading DOOM: ' + message);
                appendOutput('');
                document.getElementById('terminal-input-line').style.display = 'flex';
                const monitor = document.querySelector('.monitor');
                if (monitor) {
                    monitor.style.display = 'flex';
                }
            },
            onload: function(dosbox) {
                console.log('DOSBox loaded, attempting to run DOOM...');
                
                // Use .jsdos bundle (recommended and easiest way)
                const doomBundle = "doom/doom.jsdos";
                
                // Alternative: Use ZIP archive (uncomment if using ZIP instead)
                // const doomPath = "doom/doom.zip";
                // const doomExe = "./DOOM.EXE";
                
                // Check if file exists first
                fetch(doomBundle, { method: 'HEAD' })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`File not found: ${doomBundle} (${response.status})`);
                        }
                        console.log('DOOM bundle found, starting...');
                        
                        // Update loading message
                        doomContainer.innerHTML = `
                            <div style="color: var(--accent); font-family: monospace; text-align: center;">
                                <div style="font-size: 24px; margin-bottom: 20px;">Starting DOOM...</div>
                                <div style="font-size: 14px; opacity: 0.7;">This may take a moment</div>
                            </div>
                        `;
                        
                        try {
                            // Run from .jsdos bundle
                            dosbox.run(doomBundle);
                            console.log('DOOM started successfully');
                            
                            // If using ZIP instead, use this:
                            // dosbox.run(doomPath, doomExe);
                        } catch (error) {
                            console.error('Error running DOOM:', error);
                            showDoomError('Error starting DOOM: ' + error.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error checking DOOM file:', error);
                        showDoomError('DOOM file not found: ' + doomBundle);
                    });
            }
        });
    }
    
    // Check if Dos is available, if not wait a bit
    if (typeof Dos === 'undefined') {
        // Wait for js-dos to load (max 5 seconds)
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof Dos !== 'undefined') {
                clearInterval(checkInterval);
                initDoom();
            } else if (attempts > 50) {
                clearInterval(checkInterval);
                initDoom(); // Will show error
            }
        }, 100);
    } else {
        initDoom();
    }
    
    // Add ESC key handler to exit
    const escapeHandler = (e) => {
        if (e.key === 'Escape' && doomRunning) {
            e.preventDefault();
            stopDoom();
        }
    };
    
    document.addEventListener('keydown', escapeHandler);
    
    // Store handler for cleanup
    doomContainer._escapeHandler = escapeHandler;
}

function showDoomError(message) {
    stopDoom();
    const terminalOutput = document.getElementById('terminal-output');
    Array.from(terminalOutput.children).forEach(child => {
        child.style.display = '';
    });
    appendOutput('Error: ' + message);
    appendOutput('');
    appendOutput('INSTRUCTIONS TO SETUP DOOM:');
    appendOutput('');
    appendOutput('1. Download DOOM shareware (free):');
    appendOutput('   https://www.doomworld.com/idgames/');
    appendOutput('   (look for doom19s.zip - shareware version)');
    appendOutput('');
    appendOutput('2. Extract files: DOOM.EXE and doom1.wad');
    appendOutput('');
    appendOutput('3. Create .jsdos bundle:');
    appendOutput('   - Go to https://js-dos.com/games/');
    appendOutput('   - Click "Create Game"');
    appendOutput('   - Upload DOOM.EXE and doom1.wad');
    appendOutput('   - Set command: DOOM.EXE');
    appendOutput('   - Download the .jsdos file');
    appendOutput('');
    appendOutput('4. Place doom.jsdos file in doom/ folder');
    appendOutput('   (Path should be: doom/doom.jsdos)');
    appendOutput('');
    appendOutput('5. Refresh this page and try again!');
    appendOutput('');
    appendOutput('Note: Check browser console (F12) for details.');
    appendOutput('');
    document.getElementById('terminal-input-line').style.display = 'flex';
    const monitor = document.querySelector('.monitor');
    if (monitor) {
        monitor.style.display = 'flex';
    }
}

function stopDoom() {
    if (!doomRunning) return;
    
    doomRunning = false;
    
    // Remove escape handler
    if (doomContainer && doomContainer._escapeHandler) {
        document.removeEventListener('keydown', doomContainer._escapeHandler);
        doomContainer._escapeHandler = null;
    }
    
    // Remove iframe if exists
    const iframe = document.getElementById('doom-iframe');
    if (iframe) {
        iframe.src = ''; // Stop loading
        iframe.remove();
    }
    
    // Stop DOSBox if running (for local version)
    if (dosboxInstance && typeof dosboxInstance.stop === 'function') {
        try {
            dosboxInstance.stop();
        } catch (e) {
            console.error('Error stopping DOSBox:', e);
        }
        dosboxInstance = null;
    }
    
    // Hide DOOM container
    if (doomContainer) {
        doomContainer.style.display = 'none';
        doomContainer.innerHTML = '';
    }
    
    // Show monitor
    const monitor = document.querySelector('.monitor');
    if (monitor) {
        monitor.style.display = 'flex';
    }
    
    // Show terminal output
    const terminalOutput = document.getElementById('terminal-output');
    Array.from(terminalOutput.children).forEach(child => {
        child.style.display = '';
    });
    
    // Show terminal input
    document.getElementById('terminal-input-line').style.display = 'flex';
    
    // Add exit message
    appendOutput('');
    appendOutput('DOOM session ended.');
    appendOutput('');
    
    // Focus back on terminal
    if (terminalReady) {
        document.getElementById('terminal-input').focus();
    }
}


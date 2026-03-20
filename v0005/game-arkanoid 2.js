// ╔════════════════════════════════════════════════════════════════════╗
// ║  ARKANOID GAME - ASCII STYLE                                       ║
// ╚════════════════════════════════════════════════════════════════════╝

function startArkanoid() {
    const output = document.getElementById('terminal-output');
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas || !output) return;
    
    output.innerHTML += `
╔════════════════════════════════════════════════════════════════════╗
║  ARKANOID GAME                                                     ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  Controls:                                                         ║
║    ← →  - Move paddle                                             ║
║    SPACE - Launch ball / Pause                                    ║
║    ESC   - Exit game                                              ║
║                                                                    ║
║  Status: ████████░░ Ready to play!                                ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

Press SPACE to start...
`;

    canvas.classList.add('active');
    
    // Simple game initialization would go here
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('ARKANOID - Coming Soon!', canvas.width/2, canvas.height/2);
    ctx.fillText('Press ESC to exit', canvas.width/2, canvas.height/2 + 40);
    
    // Exit on ESC
    const exitHandler = (e) => {
        if (e.key === 'Escape') {
            canvas.classList.remove('active');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.removeEventListener('keydown', exitHandler);
            output.innerHTML += '\n\nGame exited.\n\n';
        }
    };
    
    document.addEventListener('keydown', exitHandler);
}

window.startArkanoid = startArkanoid;

(() => {
    const BUNDLE_URL = './doom.jsdos';
    const BACK_URL = '../';
    const statusElement = document.getElementById('doom-status');
    const playerElement = document.getElementById('doom-player');
    const mobileGateElement = document.getElementById('doom-mobile-gate');
    const fullscreenButton = document.getElementById('doom-fullscreen');
    const backLink = document.querySelector('[data-back-link]');
    let playerApi = null;

    if (backLink) {
        backLink.href = BACK_URL;
    }

    function renderStatus(title, message, state = 'loading', action) {
        if (!statusElement) return;

        statusElement.dataset.state = state;
        statusElement.classList.remove('is-hidden');
        statusElement.replaceChildren();

        const titleElement = document.createElement('strong');
        titleElement.textContent = title;
        statusElement.appendChild(titleElement);

        const messageElement = document.createElement('span');
        messageElement.textContent = message;
        statusElement.appendChild(messageElement);

        if (action) {
            const actionLink = document.createElement('a');
            actionLink.href = action.href;
            actionLink.textContent = action.label;
            actionLink.target = action.target || '_self';
            statusElement.appendChild(actionLink);
        }
    }

    function hideReadyStatus() {
        if (statusElement) {
            statusElement.classList.add('is-hidden');
        }
    }

    function isMobileDevice() {
        return typeof window.matchMedia === 'function' && (
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(max-width: 700px)').matches
        );
    }

    async function bundleExists() {
        try {
            const response = await fetch(BUNDLE_URL, {
                method: 'HEAD',
                cache: 'no-store',
            });
            return response.ok || response.status === 405;
        } catch (error) {
            return false;
        }
    }

    function showMissingBundle() {
        renderStatus(
            'DOOM bundle missing',
            'Add doom/doom.jsdos to the active site before starting the local player.',
            'error',
            { href: 'README.md', label: 'read setup instructions' }
        );
    }

    function startPlayer() {
        if (!playerElement) return;

        if (typeof window.Dos !== 'function') {
            renderStatus(
                'Runtime unavailable',
                'The official js-dos v8 runtime could not be loaded. Check the network connection and refresh.',
                'error'
            );
            return;
        }

        try {
            playerApi = window.Dos(playerElement, {
                url: BUNDLE_URL,
                lang: 'en',
                theme: 'black',
                fullScreen: true,
                autoStart: true,
                mouseCapture: false,
                imageRendering: 'pixelated',
                renderAspect: '4/3',
                onEvent(event) {
                    if (event === 'emu-ready' || event === 'bnd-play') {
                        renderStatus('DOOM runtime ready', 'Keyboard focus follows the game screen.', 'ready');
                        window.setTimeout(hideReadyStatus, 2400);
                    }
                },
            });
        } catch (error) {
            renderStatus(
                'DOOM failed to start',
                'The bundle exists, but js-dos could not initialize it. Check the bundle setup and refresh.',
                'error'
            );
            console.error('DOOM player initialization failed:', error);
        }
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            if (playerApi && typeof playerApi.setFullScreen === 'function') {
                playerApi.setFullScreen(true);
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        });
    }

    async function boot() {
        if (isMobileDevice()) {
            mobileGateElement.hidden = false;
            statusElement.classList.add('is-hidden');
            playerElement.hidden = true;
            return;
        }

        renderStatus('Loading local DOOM bundle…', 'Checking `doom/doom.jsdos`.');

        if (!(await bundleExists())) {
            showMissingBundle();
            return;
        }

        startPlayer();
    }

    boot();
})();

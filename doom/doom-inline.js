(() => {
    const BUNDLE_URL = 'doom/doom.jsdos';
    const RUNTIME_SCRIPT_URL = 'https://v8.js-dos.com/latest/js-dos.js';
    const RUNTIME_STYLES_URL = 'https://v8.js-dos.com/latest/js-dos.css';
    const panel = document.getElementById('doom-inline-panel');
    const playerElement = document.getElementById('doom-inline-player');
    const statusElement = document.getElementById('doom-inline-status');
    const mobileGateElement = document.getElementById('doom-mobile-gate');
    const monitorElement = document.querySelector('.monitor');
    let playerApi = null;
    let runtimePromise = null;
    let openingPromise = null;
    window.doomInlineActive = false;

    if (!panel || !playerElement || !statusElement) {
        return;
    }

    function renderStatus(title, message, state = 'loading', action) {
        statusElement.hidden = false;
        statusElement.dataset.state = state;
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
            statusElement.appendChild(actionLink);
        }
    }

    function hideStatus() {
        statusElement.hidden = true;
    }

    function isMobileDevice() {
        return typeof window.matchMedia === 'function' && (
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(max-width: 700px)').matches
        );
    }

    function showMobileGate() {
        mobileGateElement.hidden = false;
        playerElement.hidden = true;
        hideStatus();
    }

    function focusTerminal() {
        const input = document.getElementById('terminal-input');
        if (input) {
            input.focus();
        }
    }

    function scrollTerminalToPlayer() {
        const content = document.querySelector('.monitor-content');
        if (!content) return;

        window.requestAnimationFrame(() => {
            const contentRect = content.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();
            const panelTop = panelRect.top - contentRect.top + content.scrollTop;
            const maxScrollTop = Math.max(0, content.scrollHeight - content.clientHeight);
            content.scrollTop = Math.min(maxScrollTop, Math.max(0, panelTop - 8));
        });
    }

    function releasePlayer() {
        if (playerApi) {
            ['stop', 'exit', 'destroy'].forEach((method) => {
                if (typeof playerApi[method] === 'function') {
                    try {
                        playerApi[method]();
                    } catch (error) {
                        console.warn(`DOOM player cleanup failed in ${method}():`, error);
                    }
                }
            });
        }

        playerApi = null;
        playerElement.replaceChildren();
    }

    function ensureRuntimeStyles() {
        if (document.querySelector('[data-doom-runtime-styles]')) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = RUNTIME_STYLES_URL;
        link.dataset.doomRuntimeStyles = 'true';
        document.head.appendChild(link);
    }

    function ensureRuntime() {
        if (typeof window.Dos === 'function') {
            return Promise.resolve();
        }

        if (runtimePromise) {
            return runtimePromise;
        }

        ensureRuntimeStyles();
        runtimePromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('[data-doom-runtime-script]');
            const script = existingScript || document.createElement('script');

            const onLoad = () => {
                if (typeof window.Dos === 'function') {
                    resolve();
                } else {
                    reject(new Error('js-dos runtime loaded without Dos API'));
                }
            };

            const onError = () => reject(new Error('js-dos runtime failed to load'));

            script.addEventListener('load', onLoad, { once: true });
            script.addEventListener('error', onError, { once: true });

            if (!existingScript) {
                script.src = RUNTIME_SCRIPT_URL;
                script.dataset.doomRuntimeScript = 'true';
                document.body.appendChild(script);
            } else if (typeof window.Dos === 'function') {
                onLoad();
            }
        });

        return runtimePromise;
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
            'The local shareware bundle is not available in this build.',
            'error',
            { href: 'doom/README.md', label: 'read setup instructions' }
        );
    }

    function showRuntimeError() {
        renderStatus(
            'Runtime unavailable',
            'The official js-dos v8 runtime could not be loaded. Check the network and refresh.',
            'error'
        );
    }

    function startPlayer() {
        releasePlayer();

        playerApi = window.Dos(playerElement, {
            url: BUNDLE_URL,
            lang: 'en',
                theme: 'black',
                fullScreen: false,
                autoStart: true,
                mouseCapture: false,
                imageRendering: 'pixelated',
                renderAspect: '4/3',
                onEvent(event) {
                    if (event === 'emu-ready' || event === 'bnd-play') {
                        renderStatus('DOOM runtime ready', 'Keyboard focus follows the game screen.', 'ready');
                    window.setTimeout(hideStatus, 1800);
                }
            },
        });

        renderStatus('DOOM runtime ready', 'Keyboard focus follows the game screen.', 'ready');
        window.setTimeout(hideStatus, 1800);
    }

    async function open() {
        panel.hidden = false;
        panel.dataset.state = 'loading';
        window.doomInlineActive = true;
        monitorElement?.classList.add('doom-mode');

        if (isMobileDevice()) {
            panel.dataset.state = 'mobile';
            showMobileGate();
            return;
        }

        mobileGateElement.hidden = true;
        playerElement.hidden = false;

        if (playerApi) {
            return;
        }

        if (openingPromise) {
            return openingPromise;
        }

        renderStatus('Loading local DOOM bundle…', 'Checking doom/doom.jsdos.');
        openingPromise = (async () => {
            if (!(await bundleExists())) {
                showMissingBundle();
                panel.dataset.state = 'error';
                return;
            }

            try {
                await ensureRuntime();
                startPlayer();
                panel.dataset.state = 'ready';
                window.setTimeout(scrollTerminalToPlayer, 80);
            } catch (error) {
                panel.dataset.state = 'error';
                showRuntimeError();
                console.error('Inline DOOM player failed to start:', error);
                scrollTerminalToPlayer();
            }
        })();

        try {
            await openingPromise;
        } finally {
            openingPromise = null;
        }
    }

    function close() {
        releasePlayer();
        panel.hidden = true;
        panel.dataset.state = 'closed';
        window.doomInlineActive = false;
        monitorElement?.classList.remove('doom-mode');
        hideStatus();
        focusTerminal();
    }

    window.doomInlinePlayer = {
        open,
        close,
    };
})();

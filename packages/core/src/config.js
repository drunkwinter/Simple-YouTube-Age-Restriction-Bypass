/**
 * These are the proxy servers that are sometimes required to unlock videos with age restrictions.
 * You can host your own account proxy instance. See https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/tree/main/account-proxy
 * To learn what information is transferred, please read: https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass#privacy
 */
const ACCOUNT_PROXY_SERVER_HOST = 'https://youtube-proxy.zerody.one';
const VIDEO_PROXY_SERVER_HOST = 'https://ny.4everproxy.com';

// User needs to confirm the unlock process on embedded player?
let ENABLE_UNLOCK_CONFIRMATION_EMBED = true;

// Show notification?
let ENABLE_UNLOCK_NOTIFICATION = true;

// Disable content warnings?
let SKIP_CONTENT_WARNINGS = true;

// WORKAROUND: prevent tree shaking on these exports
export default window[Symbol()] = {
    ACCOUNT_PROXY_SERVER_HOST,
    VIDEO_PROXY_SERVER_HOST,
    ENABLE_UNLOCK_CONFIRMATION_EMBED,
    ENABLE_UNLOCK_NOTIFICATION,
    SKIP_CONTENT_WARNINGS,
};

// This allows the extension to override the settings that can be set via the extension popup.
function apply_config(options) {
    for (const option in options) {
        switch (option) {
            case 'unlockNotification':
                ENABLE_UNLOCK_NOTIFICATION = options[option];
                break;
            case 'unlockConfirmation':
                ENABLE_UNLOCK_CONFIRMATION_EMBED = options[option];
                break;
            case 'skipContentWarnings':
                SKIP_CONTENT_WARNINGS = options[option];
                break;
        }
    }
}

// Apply initial extension configuration
apply_config(window.SYARB_CONFIG);

// Listen for config changes
window.addEventListener('SYARB_CONFIG_CHANGE', (e) => apply_config(e.detail));

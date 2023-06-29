import Config from '../../config.js';
import { create_element, is_embed, is_mobile, is_music, page_loaded } from '../../utils/utils.js';

import tDesktop from 'raw:./templates/desktop.html';
import tMobile from 'raw:./templates/mobile.html';

const template = is_mobile ? tMobile : tDesktop;

const nToastContainer = create_element('div', { id: 'toast-container', innerHTML: template });
const nToast = nToastContainer.querySelector(':scope > *');

// On YT Music show the toast above the player controls
if (is_music) {
    nToast.style['margin-bottom'] = '85px';
}

if (is_mobile) {
    nToast.nMessage = nToast.querySelector('.notification-action-response-text');
    nToast.show = (message) => {
        nToast.nMessage.innerText = message;
        nToast.setAttribute('dir', 'in');
        setTimeout(() => {
            nToast.setAttribute('dir', 'out');
        }, nToast.duration + 225);
    };
}

async function show(message, duration = 5) {
    if (!Config.ENABLE_UNLOCK_NOTIFICATION || is_embed) return;

    await page_loaded();

    // Do not show notification when tab is in background
    if (document.visibilityState === 'hidden') return;

    // Append toast container to DOM, if not already done
    if (!nToastContainer.isConnected) document.documentElement.append(nToastContainer);

    nToast.duration = duration * 1000;
    nToast.show(message);
}

export default { show };

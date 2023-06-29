import Config from '../../config.js';

import buttonTemplate from 'raw:./templates/button.html';
import { create_element, is_confirmed, is_embed, set_url_params, wait_for_element } from '../../utils/utils.js';

const confirmationButtonId = 'confirmButton';
const confirmationButtonText = 'Click to unlock';

const buttons = {};

async function addButton(id, text, backgroundColor, onClick) {
    const errorScreenElement = await wait_for_element('.ytp-error', 2000);
    const buttonElement = create_element('div', { class: 'button-container', innerHTML: buttonTemplate });
    buttonElement.getElementsByClassName('button-text')[0].innerText = text;

    if (backgroundColor) {
        buttonElement.querySelector(':scope > div').style['background-color'] = backgroundColor;
    }

    if (typeof onClick === 'function') {
        buttonElement.addEventListener('click', onClick);
    }

    // Button already attached?
    if (buttons[id] && buttons[id].isConnected) {
        return;
    }

    buttons[id] = buttonElement;
    errorScreenElement.append(buttonElement);
}

function removeButton(id) {
    if (buttons[id] && buttons[id].isConnected) {
        buttons[id].remove();
    }
}

export function isConfirmationRequired() {
    return !is_confirmed && is_embed && Config.ENABLE_UNLOCK_CONFIRMATION_EMBED;
}

export function requestConfirmation() {
    addButton(confirmationButtonId, confirmationButtonText, null, () => {
        removeButton(confirmationButtonId);
        set_url_params({
            unlock_confirmed: 1,
            autoplay: 1,
        });
    });
}

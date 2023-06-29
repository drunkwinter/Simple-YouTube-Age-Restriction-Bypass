import playerResponse from '../observables/playerResponse.js';
import Config from '../config.js';
import Toast from '../ui/toast/index.js';
import { isConfirmationRequired, requestConfirmation } from '../ui/confirmation/index.js';
import { get_current_video_start_time, get_signature_timestamp, get_ytcfg_value, is_embed } from '../utils/utils.js';
import Logger from '../utils/Logger.js';
import { try_unlock_response_with_strategies } from '../unlocker/unlocker.js';
import { AP, CA, CWB, TVEP } from '../unlocker/strategies/strategies.js';

const MESSAGE_SUCCESS = 'Age-restricted video successfully unlocked!';
const MESSAGE_FAIL = 'Unable to unlock this video 🙁 - More information in the developer console';

const logger = new Logger('PLAYER');

export function init() {
    const _ = playerResponse.subscribe(process);
}

function process(initial_response) {
    try {
        // const status = initial_response.playabilityStatus?.status ?? initial_response.previewPlayabilityStatus?.status;
        const playabilityStatus = initial_response.playabilityStatus ?? initial_response.previewPlayabilityStatus;

        if (!is_age_restricted(playabilityStatus)) {
            return;
        }

        if (!Config.SKIP_CONTENT_WARNINGS && is_content_warning(playabilityStatus.status)) {
            return;
        }

        // Check if the user has to confirm the unlock first
        if (isConfirmationRequired()) {
            requestConfirmation();
            return;
        }

        const video_id = initial_response.videoDetails?.videoId ?? get_ytcfg_value('PLAYER_VARS').video_id;
        const client_name = get_ytcfg_value('INNERTUBE_CLIENT_NAME') ?? 'WEB';
        const client_version = get_ytcfg_value('INNERTUBE_CLIENT_VERSION') ?? '2.20220203.04.00';
        const signature_timestamp = get_signature_timestamp();
        const start_time_seconds = get_current_video_start_time(video_id);
        const hl = get_ytcfg_value('HL');

        const ordered_strategies = [
            CWB(client_name, client_version, hl, signature_timestamp, start_time_seconds, video_id),
            TVEP(hl, signature_timestamp, start_time_seconds, video_id),
            CA(hl, signature_timestamp, start_time_seconds, video_id),
            AP(client_name, client_version, hl, signature_timestamp, start_time_seconds, video_id),
        ];

        const unlocked_response = try_unlock_response_with_strategies(ordered_strategies, logger);

        if (unlocked_response) {
            // Overwrite the embedded playabilityStatus with the unlocked one
            if (is_embed) {
                unlocked_response.previewPlayabilityStatus = unlocked_response.playabilityStatus;
            }

            Toast.show(MESSAGE_SUCCESS);
            logger.info('Video was unlocked');

            playerResponse.set_value(unlocked_response);
        } else {
            Toast.show(MESSAGE_FAIL);
            throw '';
        }
    } catch (err) {
        Toast.show(MESSAGE_FAIL);
        logger.error('Unlock failed', err);
    }
}

function is_age_restricted(playability_status) {
    switch (playability_status.status) {
        case 'AGE_VERIFICATION_REQUIRED':
        case 'AGE_CHECK_REQUIRED':
        case 'CONTENT_CHECK_REQUIRED':
        case 'LOGIN_REQUIRED':
            return true;
    }

    if ('desktopLegacyAgeGateReason' in playability_status) {
        return true;
    }

    // Fix to detect age restrictions on embed player
    // see https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/issues/85#issuecomment-946853553
    return playability_status.errorScreen?.playerErrorMessageRenderer?.reason?.runs?.find((x) => x?.navigationEndpoint)
        ?.navigationEndpoint?.urlEndpoint?.url?.includes('/2802167');
}

function is_content_warning(status) {
    switch (status) {
        case 'AGE_CHECK_REQUIRED':
        case 'CONTENT_CHECK_REQUIRED':
            return true;
    }

    return false;
}

export default {
    init,
};

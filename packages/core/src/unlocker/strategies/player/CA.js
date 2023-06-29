import { innertube } from "../../../endpoints/endpoints.js";
import { is_user_logged_in } from "../../../utils/utils.js";
import { is_response_ok, tracking_param_workaround } from '../../helpers.js';

/**
 * Creator + Auth
 *
 * Retrieve the video info by using the WEB_CREATOR client in combination with user authentication
 * Requires that the user is logged in. Can bypass the tightened age verification in the EU.
 * See https://github.com/yt-dlp/yt-dlp/pull/600
 */
export function CA(hl, signatureTimestamp, startTimeSecs, videoId) {
    const payload = {
        context: {
            client: {
                clientName: 'WEB_CREATOR',
                clientVersion: '1.20210909.07.00',
                hl,
            },
        },
        playbackContext: {
            contentPlaybackContext: {
                signatureTimestamp,
            },
        },
        videoId,
        startTimeSecs,
        racyCheckOk: true,
        contentCheckOk: true,
    };

    return {
        name: 'Creator + Auth',

        unusability_reason: 'Not Implemented',

        is_usable() {
            if (is_user_logged_in()) {
                return true;
            }

            this.unusability_reason = 'User must be logged in';

            return false;
        },

        fetch() {
            // const cache = responseCache.get(video_id);

            // if (cache) {
            //     console.log('FROM CACHE!');
            //     return createDeepCopy(cache);
            // }

            const response = innertube.getPlayer(payload, true) ?? {};

            if (is_response_ok(response)) {
                tracking_param_workaround(response);

                // responseCache.set(video_id, createDeepCopy(response));

                return response;
            }

            return null;
        },
    };
}

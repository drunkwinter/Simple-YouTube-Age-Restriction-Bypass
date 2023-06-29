import { innertube } from "../../../endpoints/endpoints.js";
import { Player } from "../../../store.js";
import { is_response_ok, tracking_param_workaround } from '../../helpers.js';

/**
 * Content Warning Bypass
 *
 * Retrieve the video info by just adding `racyCheckOk` and `contentCheckOk` params
 * This strategy can be used to bypass content warnings
 */
export function CWB(clientName, clientVersion, hl, signatureTimestamp, startTimeSecs, videoId) {
    const payload = {
        context: {
            client: {
                clientName,
                clientVersion,
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
        name: 'Content Warning Bypass',

        unusability_reason: 'Not Implemented',

        is_usable() {
            switch (Player.status) {
                case 'AGE_CHECK_REQUIRED':
                case 'CONTENT_CHECK_REQUIRED':
                    return true;
            }

            this.unusability_reason = 'Status "AGE_CHECK_REQUIRED" or "CONTENT_CHECK_REQUIRED" is required';

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

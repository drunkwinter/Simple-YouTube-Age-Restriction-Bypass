import { innertube } from '../../../endpoints/endpoints.js';
import { is_response_ok, tracking_param_workaround } from '../../helpers.js';

/**
 * TV Embedded Player
 *
 * Retrieve the video info by using the TVHTML5 Embedded client
 * This client has no age restrictions in place (2022-03-28)
 * See https://github.com/zerodytrash/YouTube-Internal-Clients
 */

export function TVEP(hl, signatureTimestamp, startTimeSecs, videoId) {
    const payload = {
        context: {
            client: {
                clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER',
                clientVersion: '2.0',
                clientScreen: 'WATCH',
                hl,
            },
            thirdParty: {
                embedUrl: 'https://www.youtube.com/',
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
        name: 'TV Embedded Player',

        unusability_reason: 'Not Implemented',

        is_usable: () => true,

        fetch() {
            // const cache = responseCache.get(video_id);

            // if (cache) {
            //     console.log('FROM CACHE!');
            //     return createDeepCopy(cache);
            // }

            const response = innertube.getPlayer(payload, false) ?? {};

            if (is_response_ok(response)) {
                tracking_param_workaround(response);

                // responseCache.set(video_id, createDeepCopy(response));

                return response;
            }

            return null;
        }
    };
}

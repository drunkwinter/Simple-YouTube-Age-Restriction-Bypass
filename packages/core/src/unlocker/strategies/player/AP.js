import Config from '../../../config.js';
import observable_Request from '../../../observables/Request.js';
import { proxy } from '../../../endpoints/endpoints.js';
import { is_confirmed, is_embed } from '../../../utils/utils.js';
import { Player } from '../../../store.js';
import { is_response_ok, tracking_param_workaround } from '../../helpers.js';

/**
 * Account Proxy
 *
 * Retrieve the video info from an account proxy server.
 * Session cookies of an age-verified Google account are stored on server side.
 * See https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/tree/main/account-proxy
 */
export function AP(clientName, clientVersion, hl, signatureTimestamp, startTimeSecs, videoId) {
    const payload = {
        reason: Player.status,
        clientName,
        clientVersion,
        hl,
        signatureTimestamp,
        startTimeSecs,
        isEmbed: +is_embed,
        isConfirmed: +is_confirmed,
        videoId,
    };

    return {
        name: 'Account Proxy',

        unusability_reason: 'Not Implemented',

        is_usable: () => true,

        fetch() {
            // const cache = responseCache.get(video_id);

            // if (cache) {
            //     console.log('FROM CACHE!');
            //     start_background_process(cache);
            //     return createDeepCopy(cache);
            // }

            const response = proxy.getPlayer(payload) ?? {};

            if (is_response_ok(response)) {
                if (startTimeSecs) {
                    account_proxy_workaround(response, startTimeSecs);
                }

                tracking_param_workaround(response);

                same_country_workaround(response);

                // responseCache.set(video_id, createDeepCopy(response));

                return response;
            }

            return null;
        },

    };
}

/**
 * Workaround: Account proxy response currently does not include `playerConfig`
 *
 * Stays here until we rewrite the account proxy to only include the necessary and bare minimum response
 */
function account_proxy_workaround(response, config) {
    response.playerConfig = {
        playbackStartConfig: {
            startSeconds: config.startTimeSecs,
        },
    };
}

/**
 * Workaround: Account proxy responses sometimes only can be played in the same country it was requested
 *
 * Check if we need to proxy the video urls if it contains the `gcr` parameter.
 * If we do, then modify the url to point to the video proxy based in the same country.
 */
function same_country_workaround(response) {
    const firstFormat = response.streamingData.adaptiveFormats[0];

    const firstFormatUrl = firstFormat.signatureCipher
        ? new URLSearchParams(firstFormat.signatureCipher).get('url')
        : firstFormat.url;

    const isVideoCountryLocked = firstFormatUrl.includes('gcr=');

    if (!isVideoCountryLocked) {
        return;
    }

    /**
     * Modify request URL to point to the video proxy for the duration of the page lifecycle
     */
    subscribe_till_page_change(observable_Request, ([url, options]) => {
        if (!url.includes('gcr=')) {
            return;
        }

        // Exclude credentials from Fetch Request to prevent CORS.
        options.credentials = 'omit';

        url = `${Config.VIDEO_PROXY_SERVER_HOST}/direct/${btoa(url)}`;

        observable_Request.set_value([url, options]);
    });
};

function subscribe_till_page_change(observable, callback) {
    const unsub = observable.subscribe(callback);
    const unsub_wrapper = () => {
        unsub();
        window.removeEventListener('popstate', unsub_wrapper);
        window.removeEventListener('yt-navigate-start', unsub_wrapper);
    };

    window.addEventListener('popstate', unsub_wrapper);
    window.addEventListener('yt-navigate-start', unsub_wrapper);
}

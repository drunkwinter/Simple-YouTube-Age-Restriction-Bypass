import { get_ytcfg_value, is_mobile, is_empty_watch_next_sidebar } from '../utils/utils.js';
import { try_unlock_response_with_strategies } from '../unlocker/unlocker.js';
import Logger from '../utils/Logger.js';
import watch_next_response from '../observables/nextResponse.js';
import { AP_Next, CWB_Next } from '../unlocker/strategies/strategies.js';

const logger = new Logger('SIDEBAR');

export function init() {
    const _ = watch_next_response.subscribe(process);
}

function process(initial_response) {
    try {
        initial_response = initial_response.response ?? initial_response;

        if (!is_empty_watch_next_sidebar(initial_response)) return;

        const video_id = initial_response.currentVideoEndpoint.watchEndpoint.videoId;
        const client_name = get_ytcfg_value('INNERTUBE_CLIENT_NAME') ?? 'WEB';
        const client_version = get_ytcfg_value('INNERTUBE_CLIENT_VERSION') ?? '2.20220203.04.00';
        const hl = get_ytcfg_value('HL');
        const user_interface_theme = get_ytcfg_value('INNERTUBE_CONTEXT').client.userInterfaceTheme
            ?? (document.documentElement.hasAttribute('dark') ? 'USER_INTERFACE_THEME_DARK' : 'USER_INTERFACE_THEME_LIGHT');

        const ordered_strategies = [
            CWB_Next(client_name, client_version, hl, user_interface_theme, video_id),
            AP_Next(client_name, client_version, hl, user_interface_theme, video_id),
        ];

        const unlocked_response = try_unlock_response_with_strategies(ordered_strategies, logger);

        if (!unlocked_response) {
            throw '';
        }

        if (is_mobile) {
            // Transfer WatchNextResults to original response
            const unlockedWatchNextFeed = unlocked_response.contents.singleColumnWatchNextResults.results.results
            .contents.find((x) => x.itemSectionRenderer.targetId === 'watch-next-feed');

            initial_response.contents.singleColumnWatchNextResults.results.results.contents.push(unlockedWatchNextFeed);
            return;
        }

        // Transfer WatchNextResults to original response
        initial_response.contents.twoColumnWatchNextResults.secondaryResults =
        unlocked_response.contents.twoColumnWatchNextResults.secondaryResults;
    } catch (err) {
        logger.error('Unlock failed', err);
    }
}

export default {
    init,
};

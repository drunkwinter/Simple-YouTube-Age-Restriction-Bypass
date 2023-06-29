import { get_ytcfg_value, is_mobile, is_empty_watch_next_sidebar } from '../utils/utils.js';
import { try_unlock_response_with_strategies } from '../unlocker/unlocker.js';
import Logger from '../utils/Logger.js';
import next_response from '../observables/nextResponse.js';
import { CWB_Next, AP_Next } from '../unlocker/strategies/strategies.js';

const logger = new Logger('DESCRIPTION');

export function init() {
    const _ = next_response.subscribe(process);
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

        if (is_mobile) {
            // Transfer video description to original response
            const original_description = initial_response.engagementPanels
                .find((x) => x.engagementPanelSectionListRenderer)
                .engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items.find((x) =>
                    x.expandableVideoDescriptionBodyRenderer
                );
            const unlocked_description = unlocked_response.engagementPanels
                .find((x) => x.engagementPanelSectionListRenderer)
                .engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items.find((x) =>
                    x.expandableVideoDescriptionBodyRenderer
                );

            if (unlocked_description.expandableVideoDescriptionBodyRenderer) {
                original_description.expandableVideoDescriptionBodyRenderer =
                    unlocked_description.expandableVideoDescriptionBodyRenderer;
            }

            return;
        }

        // Transfer video description to original response
        const original_description =
            initial_response.contents.twoColumnWatchNextResults.results.results.contents.find(
                (x) => x.videoSecondaryInfoRenderer,
            ).videoSecondaryInfoRenderer;
        const unlocked_description =
            unlocked_response.contents.twoColumnWatchNextResults.results.results.contents.find(
                (x) => x.videoSecondaryInfoRenderer,
            ).videoSecondaryInfoRenderer;

        // TODO: Throw if description not found?
        if (unlocked_description.description) {
            original_description.description = unlocked_description.description;
        } else if (unlocked_description.attributedDescription) {
            original_description.attributedDescription =
                unlocked_description.attributedDescription;
        }
    } catch (err) {
        logger.error('Unlock failed', err);
    }
}

export default {
    init,
};

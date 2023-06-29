import { find_nested_objects_by_attribute_names } from '../utils/utils.js';
import Logger from '../utils/Logger.js';
import initial_data from '../observables/initialData.js';
import JSON_parse from '../observables/JSONParse.js';

const logger = new Logger('THUMBNAIL');

export function init() {
    const _ = initial_data.subscribe(process);
    const __ = JSON_parse.subscribe(process);

    function process(data) {
        try {
            if (!is_search_response(data)) return;

            const thumbnails = find_nested_objects_by_attribute_names(data, ['url', 'height']);

            let blurred_thumbnail_count = 0;

            for (const thumbnail of thumbnails) {
                if (is_thumbnail_blurred(thumbnail)) {
                    blurred_thumbnail_count++;
                    thumbnail.url = thumbnail.url.split('?')[0];
                }
            }

            logger.info(blurred_thumbnail_count + '/' + thumbnails.length + ' thumbnails detected as blurred.');
        } catch (err) {
            logger.error('Unlock failed', err);
        }
    }
}

/**
 * The SQP parameter length is different for blurred thumbnails.
 * They contain more information, than normal thumbnails.
 * The thumbnail SQPs tend to have a long and a short version.
 */
const BLURRED_THUMBNAIL_SQP_LENGTH_SET = new Set([
    32, // Mobile (SHORT)
    48, // Desktop Playlist (SHORT)
    56, // Desktop (SHORT)
    68, // Mobile (LONG)
    72, // Mobile Shorts
    84, // Desktop Playlist (LONG)
    88, // Desktop (LONG)
]);

function is_thumbnail_blurred(thumbnail) {
    // Fast path
    if (!thumbnail.url.includes('sqp=')) {
        return false;
    }

    // @ts-ignore
    const SQP_length = new URL(thumbnail.url).searchParams.get('sqp').length;

    return BLURRED_THUMBNAIL_SQP_LENGTH_SET.has(SQP_length);
}

function is_search_response(value) {
    return (
        (value.contents
            && (value.contents.twoColumnSearchResultsRenderer !== undefined // Desktop initial results
                || value.contents.sectionListRenderer?.targetId === 'search-feed')) // Mobile initial results
        || !!value.onResponseReceivedCommands?.find((x) => x?.appendContinuationItemsAction?.targetId === 'search-feed') // Desktop & Mobile scroll continuation
    );
}

export default {
    init,
};

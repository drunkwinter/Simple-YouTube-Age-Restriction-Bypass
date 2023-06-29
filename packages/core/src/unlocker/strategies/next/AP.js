import { is_confirmed, is_embed, is_empty_watch_next_sidebar as is_response_not_ok } from '../../..//utils/utils.js';
import { proxy } from '../../../endpoints/endpoints.js';

/** Account Proxy */
export function AP(clientName, clientVersion, hl, userInterfaceTheme, videoId) {
    const payload = {
        videoId,
        clientName,
        clientVersion,
        hl,
        userInterfaceTheme,
        isEmbed: +is_embed,
        isConfirmed: +is_confirmed,
    };

    return {
        name: 'Account Proxy',

        unusability_reason: 'Not Implemented',

        is_usable: () => true,

        fetch() {
            const response = proxy.getNext(payload) ?? {};

            if (!is_response_not_ok(response)) {
                return response;
            }

            return null;
        },
    };
}

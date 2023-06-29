import { Player } from "../../../store.js";
import { innertube } from "../../../endpoints/endpoints.js";
import { is_empty_watch_next_sidebar as is_response_not_ok } from '../../../utils/utils.js';

/** Content Warning Bypass */
export function CWB(clientName, clientVersion, hl, userInterfaceTheme, videoId) {
    const payload = {
        context: {
            client: {
                clientName,
                clientVersion,
                hl,
                userInterfaceTheme,
            },
        },
        videoId,
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
                    return;
            }

            this.unusability_reason =  'Status "AGE_CHECK_REQUIRED" or "CONTENT_CHECK_REQUIRED" is required';

            return false;
        },

        fetch() {
            const response = innertube.getNext(payload, true) ?? {};

            if (!is_response_not_ok(response)) {
                return response;
            }

            return null;
        },
    };
}

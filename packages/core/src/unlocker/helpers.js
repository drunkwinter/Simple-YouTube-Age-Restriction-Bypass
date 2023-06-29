/**
 * Workaround: https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/issues/191
 *
 * YouTube checks if the `trackingParams` in the response matches the decoded `trackingParam` in `responseContext.mainAppWebResponseContext`.
 * However, sometimes the response does not include the `trackingParam` in the `responseContext`, causing the check to fail.
 *
 * This workaround addresses the issue by hardcoding the `trackingParams` in the response context.
 */
export function tracking_param_workaround(response) {
    if (!response.trackingParams || !response.responseContext?.mainAppWebResponseContext?.trackingParam) {
        response.trackingParams = 'CAAQu2kiEwjor8uHyOL_AhWOvd4KHavXCKw=';
        response.responseContext = {
            mainAppWebResponseContext: {
                trackingParam: 'kx_fmPxhoPZRzgL8kzOwANUdQh8ZwHTREkw2UqmBAwpBYrzRgkuMsNLBwOcCE59TDtslLKPQ-SS',
            },
        };
    }
}

export function is_response_ok(response) {
    if (response.playabilityStatus?.status) {
        switch (response.playabilityStatus.status) {
            case 'OK':
            case 'LIVE_STREAM_OFFLINE':
                return true;
        }
    }

    return false;
}

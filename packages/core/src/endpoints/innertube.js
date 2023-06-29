import sha1 from 'sha-1';

import { get_ytcfg_value, is_user_logged_in, native_JSON_parse } from '../utils/utils.js';

export const getPlayer = sendInnertubeRequest.bind(null, 'v1/player');
export const getNext = sendInnertubeRequest.bind(null, 'v1/next');

function sendInnertubeRequest(endpoint, payload, useAuth) {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.open('POST', `/youtubei/${endpoint}?key=${get_ytcfg_value('INNERTUBE_API_KEY')}&prettyPrint=false`, false);

    if (useAuth && is_user_logged_in()) {
        xmlhttp.withCredentials = true;
        xmlhttp.setRequestHeader('Authorization', generateAuthToken());
    }

    xmlhttp.send(JSON.stringify(payload));

    return native_JSON_parse(xmlhttp.responseText);
}

function generateAuthToken() {
    const sid = getCookie('SAPISID') ?? getCookie('__Secure-3PAPISID');
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const data = timestamp + ' ' + sid + ' ' + location.origin;
    return `SAPISIDHASH ${timestamp}_${sha1(data)}`;
}

function getCookie(name) {
    const name_idx = document.cookie.indexOf(name);

    if (name_idx === -1) {
        return;
    }

    const name_end_idx = name_idx + name.length + 1;

    const semicolon_idx = document.cookie.indexOf(';', name_end_idx);

    if (semicolon_idx === -1) {
        return;
    }

    return document.cookie.slice(name_end_idx, semicolon_idx);
}

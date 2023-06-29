import Config from '../config.js';
import { native_JSON_parse } from '../utils/utils.js';

export const getPlayer = sendRequest.bind(null, 'getPlayer');
export const getNext = sendRequest.bind(null, 'getNext');

function sendRequest(endpoint, payload) {
    const queryParams = new URLSearchParams(payload);
    const url = `${Config.ACCOUNT_PROXY_SERVER_HOST}/${endpoint}?${queryParams}&client=js`;

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', url, false);
    xmlhttp.send();
    return native_JSON_parse(xmlhttp.responseText);
}

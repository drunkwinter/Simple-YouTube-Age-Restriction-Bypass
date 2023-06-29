export const noop = () => {};

export const native_JSON_parse = JSON.parse;
export const native_Request = Request;

export const is_mobile = window.location.host === 'm.youtube.com';
export const is_music = window.location.host === 'music.youtube.com';
export const is_embed = window.location.pathname.includes('/embed/');
export const is_confirmed = window.location.search.includes('unlock_confirmed');

export class Deferred {
    resolve;
    reject;
    promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

export function create_element(tagName, options = {}) {
    const node = document.createElement(tagName);
    return Object.assign(node, options);
}

export function is_object(value) {
    return typeof value === 'object' && value != null;
}

export function trap_prop(owner, prop, options = {}) {
    const configurable = options.configurable ?? true;
    const getter = options.getter ?? noop;
    const setter = options.setter;

    const prev_descriptor = Object.getOwnPropertyDescriptor(owner, prop) ?? {};

    prev_descriptor.get ??= noop;
    prev_descriptor.set ??= noop;

    const descriptor = { configurable };

    let prop_value = owner[prop];

    descriptor.get = () => {
        // @ts-ignore
        prev_descriptor.get();
        return getter(prop_value) ?? prop_value;
    };

    if (options.setter) {
        descriptor.set = (value) => {
            // @ts-ignore
            prev_descriptor.set(value);
            prop_value = setter(value) ?? value;
        };
    }

    Object.defineProperty(owner, prop, descriptor);
}

export function find_nested_objects_by_attribute_names(object, attribute_names) {
    const results = [];

    // Does the current object match the attribute conditions?
    if (attribute_names.every((key) => typeof object[key] !== 'undefined')) {
        results.push(object);
    }

    // Diggin' deeper for each nested object (recursive)
    Object.keys(object).forEach((key) => {
        if (object[key] && typeof object[key] === 'object') {
            results.push(...find_nested_objects_by_attribute_names(object[key], attribute_names));
        }
    });

    return results;
}

export function page_loaded() {
    if (document.readyState === 'complete') return Promise.resolve();

    const deferred = new Deferred();

    window.addEventListener('load', deferred.resolve, { once: true });

    return deferred.promise;
}

export function create_deep_copy(obj) {
    return native_JSON_parse(JSON.stringify(obj));
}

export function get_ytcfg_value(name) {
    return window['ytcfg'].get(name);
}

export function is_user_logged_in() {
    // LOGGED_IN doesn't exist on embedded page, use DELEGATED_SESSION_ID or SESSION_INDEX as fallback
    return get_ytcfg_value('LOGGED_IN')
        ?? (get_ytcfg_value('DELEGATED_SESSION_ID') !== undefined
        || Number(get_ytcfg_value('SESSION_INDEX')) >= 0);
}

export function set_url_params(params) {
    const url_params = new URLSearchParams(window.location.search);
    for (const param_name in params) {
        url_params.set(param_name, params[param_name]);
    }
    window.location.search = url_params.toString();
}

export function wait_for_element(element_selector, timeout) {
    const deferred = new Deferred();

    const check_dom_interval = setInterval(() => {
        const elem = document.querySelector(element_selector);
        if (elem) {
            clearInterval(check_dom_interval);
            deferred.resolve(elem);
        }
    }, 100);

    if (timeout) {
        setTimeout(() => {
            clearInterval(check_dom_interval);
            deferred.reject();
        }, timeout);
    }

    return deferred.promise;
}

export function is_empty_watch_next_sidebar(response) {
    if (is_mobile) {
        // MWEB response layout
        const result = response.contents?.singleColumnWatchNextResults?.results?.results?.contents?.find((e) =>
            e?.itemSectionRenderer?.targetId === 'watch-next-feed'
        )?.itemSectionRenderer;
        return result === undefined;
    }

    // WEB response layout
    const result = response.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults
        ?.results;
    return !result;
}

export function get_current_video_start_time(current_video_id) {
    // Check if the URL corresponds to the requested video
    // This is not the case when the player gets preloaded for the next video in a playlist.
    if (window.location.href.includes(current_video_id)) {
        // "t"-param on youtu.be urls
        // "start"-param on embed player
        // "time_continue" when clicking "watch on youtube" on embedded player
        const url_params = new URLSearchParams(window.location.search);
        const start_time_string = url_params.get('t') ?? url_params.get('start') ?? url_params.get('time_continue');

        if (start_time_string) {
            return Number(start_time_string.replace('s', ''));
        }
    }

    return 0;
}

const STS_sig = /signatureTimestamp:([0-9]*)/;

export function get_signature_timestamp() {
    // STS is missing on embedded player. Retrieve from player base script as fallback...
    if (is_embed) {
        // @ts-ignore
        const player_base_js_path = document.querySelector('script[src*="/base.js"]').src;

        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', player_base_js_path, false);
        xmlhttp.send();

        const signature_timestamp = xmlhttp.responseText.match(STS_sig)[1];

        return Number(signature_timestamp);
    }

    return get_ytcfg_value('STS');
}

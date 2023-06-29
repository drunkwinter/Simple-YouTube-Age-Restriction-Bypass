import { is_embed } from '../utils/utils.js';
import Observable from '../utils/Observable.js';

import initialData from './initialData.js';
import JSONParse from './JSONParse.js';

const observable = new Observable({ init });

function init() {
    if (is_embed) {
        JSONParse.subscribe(process);
        return;
    }

    initialData.subscribe(process);

    JSONParse.subscribe(process);
}

function process(value) {
    if (isNextResponse(value)) {
        observable.emit(value);
    }
}

function isNextResponse(value) {
    value = value.response ?? value;

    return value.currentVideoEndpoint?.watchEndpoint?.videoId !== undefined
        || (value.contents
            && (value.contents.twoColumnWatchNextResults ?? value.contents.singleColumnWatchNextResults));
}

export default observable;

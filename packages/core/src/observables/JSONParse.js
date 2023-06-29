import { is_object, native_JSON_parse } from '../utils/utils.js';
import Observable from '../utils/Observable.js';

const observable = new Observable({ init });

function init() {
    JSON.parse = function(...args) {
        const value = native_JSON_parse.apply(this, args);

        if (is_object(value)) {
            observable.emit(value);
        }

        return observable.get_value() ?? value;
    };
}

export default observable;

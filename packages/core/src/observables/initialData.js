import { is_object, trap_prop } from '../utils/utils.js';
import Observable from '../utils/Observable.js';

const observable = new Observable({ init });

function init() {
    trap_prop(window, 'ytInitialData', {
        setter(value) {
            // On mobile this is a string on first call, second call will be an object.
            if (is_object(value)) {
                observable.emit(value);
            }
        },
    });
}

export default observable;

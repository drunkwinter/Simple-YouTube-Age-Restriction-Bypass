import { is_embed, trap_prop } from '../utils/utils.js';
import Observable from '../utils/Observable.js';
import JSONParse from './JSONParse.js';

const observable = new Observable({ init });

function init() {
    if (is_embed) {
        JSONParse.subscribe(process);
        return;
    }

    trap_prop(window, 'ytInitialPlayerResponse', {
        setter(value) {
            if (is_player_response(value)) {
                observable.emit(value);

                return observable.get_value();
            }
        },
    });

    JSONParse.subscribe(process);

    function process(value) {
        if (is_player_response(value)) {
            observable.emit(value);
            JSONParse.set_value(observable.get_value());
        }
    }
}

function is_player_response(value) {
    return value && (value.playabilityStatus ?? value.previewPlayabilityStatus);
}

export default observable;

import Observable from '../utils/Observable.js';

const observable = new Observable({ init });

function init() {
    Request = new Proxy(Request, {
        construct(target, args) {
            observable.emit(args);

            return Reflect.construct(target, observable.get_value() ?? args);
        },
    });
}

export default observable;

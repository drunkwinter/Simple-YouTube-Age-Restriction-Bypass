import { noop } from './utils.js';
import Logger from './Logger.js';

const logger = new Logger('OBSERVABLE');

export default class Observable {
    #subscribers = new Set();

    #initialized = false;

    #fn_init;
    #fn_deinit;

    #value;

    constructor(options = {}) {
        this.#fn_init = options.init ?? noop;
        this.#fn_deinit = options.deinit ?? noop;
    }

    subscribe(subscriber_fn) {
        this.#subscribers.add(subscriber_fn);

        if (!this.#initialized) {
            this.#fn_init();
            this.#initialized = true;
        }

        return this.unsubscribe.bind(this, subscriber_fn);
    }

    unsubscribe(subscriber) {
        logger.info('Subscriber unsubscribing!');
        this.#subscribers.delete(subscriber);

        if (this.#subscribers.size === 0) {
            logger.info('Observable deinitializing!');
            this.#fn_deinit();
            this.#initialized = false;
        }
    }

    emit(value) {
        this.#value = value;
        for (const subscriber of this.#subscribers) {
            subscriber(this.#value);
        }
    }

    set_value(value) {
        this.#value = value;
    }

    get_value() {
        return this.#value;
    }
}

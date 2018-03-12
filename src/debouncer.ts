export class Debouncer {

    public callback;
    public ticking = false;
    public rafCallback;

    constructor(callback) {
        this.callback = callback;
    }

    /**
     * dispatches the event to the supplied callback
     */
    public update() {
        if (this.callback && this.callback()) {
            this.ticking = false;
        }

    }

    /**
     * ensures events don't get stacked
     */
    public requestTick() {
        if (!this.ticking) {
            this.rafCallback = this.rafCallback || this.update.bind(this);
            requestAnimationFrame(this.rafCallback);
            this.ticking = true;
        }
    }

    /**
     * Attach this as the event listeners
     */
    public handleEvent() {
        this.requestTick();
    }
}

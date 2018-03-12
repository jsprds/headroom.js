import { Debouncer } from './debouncer';

const CLASSES = {
    pinned: 'header--pinned',
    unpinned: 'header--unpinned',
    top: 'header--top',
    notTop: 'header--not-top',
    bottom: 'header--bottom',
    notBottom: 'header--not-bottom',
    initial: 'header'
};

export class Headroom {
    public lastKnownScrollY = 0;
    public elem;
    public tolerance = {
        up: 0,
        down: 0
    };
    public offset = 0;
    public scroller: any = window;
    public initialised = false;
    public debouncer;

    constructor(element: HTMLElement, options: any = null) {
        this.elem = element;

        this.debouncer = new Debouncer(this.update.bind(this));
        this.elem.classList.add(CLASSES.initial);

        // defer event registration to handle browser
        // potentially restoring previous scroll position
        setTimeout(this.attachEvent.bind(this), 100);

        return this;
    }

    /**
     * Attaches the scroll event
     */
    public attachEvent() {
        if (!this.initialised) {
            this.lastKnownScrollY = this.getScrollY();
            this.initialised = true;
            this.scroller.addEventListener('scroll', () => {
                this.update();
            }, false);

            this.debouncer.handleEvent();
        }
    }

    /**
     * Unattaches events and removes any classes that were added
     */
    public destroy() {
        const classes = CLASSES;

        this.initialised = false;

        for (const key in classes) {
            if (classes.hasOwnProperty(key)) {
                this.elem.classList.remove(classes[key]);
            }
        }

        this.scroller.removeEventListener('scroll', this.debouncer, false);
    }

    public update() {
        console.log('UPDATE');
        const currentScrollY = this.getScrollY();
        const scrollDirection = currentScrollY > this.lastKnownScrollY ? 'down' : 'up';
        const toleranceExceeded = this.toleranceExceeded(currentScrollY, scrollDirection);

        if (this.isOutOfBounds(currentScrollY)) { // Ignore bouncy scrolling in OSX
            return;
        }

        if (currentScrollY <= this.offset) {
            this.top();
        } else {
            this.notTop();
        }

        if (currentScrollY + this.getViewportHeight() >= this.getScrollerHeight()) {
            this.bottom();
        } else {
            this.notBottom();
        }

        if (this.shouldUnpin(currentScrollY, toleranceExceeded)) {
            this.unpin();
        } else if (this.shouldPin(currentScrollY, toleranceExceeded)) {
            this.pin();
        }

        this.lastKnownScrollY = currentScrollY;
    }

    /**
     * Unpins the header if it's currently pinned
     */
    public unpin() {
        const classList = this.elem.classList;
        const classes = CLASSES;

        if (classList.contains(classes.pinned) || !classList.contains(classes.unpinned)) {
            classList.add(classes.unpinned);
            classList.remove(classes.pinned);
            // this.onUnpin && this.onUnpin.call(this);
        }
    }

    /**
     * Pins the header if it's currently unpinned
     */
    public pin() {
        const classList = this.elem.classList;
        const classes = CLASSES;

        if (classList.contains(classes.unpinned)) {
            classList.remove(classes.unpinned);
            classList.add(classes.pinned);
            // this.onPin && this.onPin.call(this);
        }
    }

    /**
    * Gets the Y scroll position
    * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
    */
    public getScrollY() {
        return (this.scroller.pageYOffset !== undefined)
            ? this.scroller.pageYOffset
            : (this.scroller.scrollTop !== undefined)
                ? this.scroller.scrollTop
                : ((document.documentElement || document.body.parentNode || document.body) as HTMLElement).scrollTop;
    }

    /**
     * determines if the tolerance has been exceeded
     */
    public toleranceExceeded(currentScrollY: any, direction: any) {
        return Math.abs(currentScrollY - this.lastKnownScrollY) >= this.tolerance[direction];
    }

    /**
     * Gets the height of the scroller element
     */
    public getScrollerHeight() {
        return (this.scroller === window || this.scroller === document.body)
            ? this.getDocumentHeight()
            : this.getElementHeight(this.scroller);
    }

    /**
     * Gets the height of the document
     * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/
     */
    public getDocumentHeight() {
        const body = document.body;
        const documentElement = document.documentElement;

        return Math.max(
            body.scrollHeight, documentElement.scrollHeight,
            body.offsetHeight, documentElement.offsetHeight,
            body.clientHeight, documentElement.clientHeight
        );
    }

    /**
     * Gets the height of the DOM element
     */
    public getElementHeight(elm: HTMLElement) {
        return Math.max(
            elm.scrollHeight,
            elm.offsetHeight,
            elm.clientHeight
        );
    }

    /**
     * determines if the scroll position is outside of document boundaries
     */
    public isOutOfBounds(currentScrollY) {
        const pastTop = currentScrollY < 0;
        const pastBottom = currentScrollY + this.getScrollerPhysicalHeight() > this.getScrollerHeight();

        return pastTop || pastBottom;
    }

    /**
     * Gets the height of the viewport
     * @see http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript
     */
    public getViewportHeight() {
        return window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;
    }

    /**
     * Gets the physical height of the DOM element
     */
    public getElementPhysicalHeight(elm) {
        return Math.max(
            elm.offsetHeight,
            elm.clientHeight
        );
    }

    /**
     * Gets the physical height of the scroller element
     */
    public getScrollerPhysicalHeight() {
        return (this.scroller === window || this.scroller === document.body)
            ? this.getViewportHeight()
            : this.getElementPhysicalHeight(this.scroller);
    }

    /**
     * Handles the top states
     */
    public top() {
        const classList = this.elem.classList;
        const classes = CLASSES;

        if (!classList.contains(classes.top)) {
            classList.add(classes.top);
            classList.remove(classes.notTop);
        }
    }

    /**
     * Handles the not top state
     */
    public notTop() {
        const classList = this.elem.classList;
        const classes = CLASSES;

        if (!classList.contains(classes.notTop)) {
            classList.add(classes.notTop);
            classList.remove(classes.top);
        }
    }

    public bottom() {
        const classList = this.elem.classList;
        const classes = CLASSES;

        if (!classList.contains(classes.bottom)) {
            classList.add(classes.bottom);
            classList.remove(classes.notBottom);
        }
    }

    /**
     * Handles the not top state
     */
    public notBottom() {
        const classList = this.elem.classList;
        const classes = CLASSES;

        if (!classList.contains(classes.notBottom)) {
            classList.add(classes.notBottom);
            classList.remove(classes.bottom);
        }
    }

    /**
     * determine if it is appropriate to unpin
     */
    public shouldUnpin(currentScrollY, toleranceExceeded) {
        const scrollingDown = currentScrollY > this.lastKnownScrollY;
        const pastOffset = currentScrollY >= this.offset;

        return scrollingDown && pastOffset && toleranceExceeded;
    }

    /**
     * determine if it is appropriate to pin
     */
    public shouldPin(currentScrollY, toleranceExceeded) {
        const scrollingUp = currentScrollY < this.lastKnownScrollY;
        const pastOffset = currentScrollY <= this.offset;

        return (scrollingUp && toleranceExceeded) || pastOffset;
    }
}

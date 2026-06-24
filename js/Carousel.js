import {escapeHTML} from "./utils.js";

class CarouselBlock extends HTMLElement {
    constructor() {
        super();
        this._currentAngleIndex = 0;
        this._size = 8;
        this._angleDiv = 0;
        this._halfTransitionTime = 0;
        this._header = "";
        this._isAnimating = false;
        this._radios = null;
        this._observer = null;
        this._title = null;
        this._titleHeader = null;
        this._titleContent = null;
        this._content = [];
    }

    async connectedCallback() {

        const dataUrl = this.getAttribute('src');
        const size = +this.getAttribute('size');
        const halfTime = +this.getAttribute('halfTime');
        this._header = this.getAttribute('header');

        if (!dataUrl) {
            console.error("Could not find the data");
            this.innerHTML = "<p>Error: no data found</p>";
            return;
        }

        if (size < 4 || size > 8) {
            console.error("The size is not allowed (must be from 4 to 8)");
            this.innerHTML = "<p>Error: the current size is not allowed (must be from 4 to 8)</p>";
            return;
        }

        try {
            const response = await fetch(dataUrl);

            if (!response.ok) {
                throw new Error("Could not find the data");
            }

            this._content = await response.json();

            this._render();
            this._applyBehavior(halfTime, size);
            this._initObserver();
        } catch (error) {
            console.error(error);
            this.innerHTML = "<p>Data processing error</p>";
        }
    }

    disconnectedCallback() {
        if (this._observer) this._observer.disconnect();
    }

    _render() {
        this.innerHTML = `
            <div class="dark carousel-block">
                <div class="blurrable width-wrapper">
                    <h3>${escapeHTML(this._header)}</h3>
                    <div class="images-wrapper">
                        ${this._content.map((item) => (
                            `<img draggable="false" class="light" src=${escapeHTML(item.source)}/>`
                        )).join('')}
                    </div>

                    <div class="text-block">

                        <button class="arrow left" aria-label="Previous slide">
                            <svg width="21" height="43" viewBox="0 0 21 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.8775 4.00012L4.87653 19.0013C3.70783 20.4622 3.70783 22.538 4.87653 23.9989L16.8775 39.0001" stroke-linecap="round"/>
                            </svg>
                        </button>

                        <div class="title">
                            <div class="slide-control">
                                ${this._content.map((item, index) => (`
                                   <span class="${(index === 0) ? "radio active" : "radio"}"></span>
                                `)).join('')}
                            </div>
                            <h4 class="semi-trans"></h4>
                            <p class="trans"></p>
                        </div>

                        <button class="arrow right" aria-label="Next slide">
                            <svg width="21" height="43" viewBox="0 0 21 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.00012 4.00012L16.0011 19.0013C17.1698 20.4622 17.1698 22.538 16.0011 23.9989L4.00012 39.0001" stroke-linecap="round"/>
                            </svg>
                        </button>

                    </div>
                </div>
            </div>`
    }

    _applyBehavior(time, size) {
        // size is an integer between 4 and 8

        this._images = this.querySelectorAll('img');
        this._radios = this.querySelectorAll('.radio');

        this._title = this.querySelector('.title');
        this._titleHeader = this._title.querySelector('h4');
        this._titleContent = this._title.querySelector('p');
        this._titleHeader.style.transition = `opacity ${time}ms ease-in-out`;
        this._titleContent.style.transition = `opacity ${time}ms ease-in-out`;

        this._size = size;
        this._angleDiv = 2 * Math.PI/this._size;
        this._updateMotion();

        this._halfTransitionTime = time;

        const rightButton = this.querySelector('.right');
        const leftButton = this.querySelector('.left');

        rightButton.addEventListener('click', () => {
            if (!this._isAnimating) {
                this._currentAngleIndex++;
                this._isAnimating = true;
                this._updateMotion();
                setTimeout(() => this._isAnimating = false, this._halfTransitionTime * 2);
            }
        });

        leftButton.addEventListener('click', () => {
            if (!this._isAnimating) {
                this._currentAngleIndex--;
                this._isAnimating = true;
                this._updateMotion();
                setTimeout(() => this._isAnimating = false, this._halfTransitionTime * 2);
            }
        });

        this._handleSwipe();
    }

    _handleSwipe() {
        let startX = 0;
        let endX = 0;
        const THRESHOLD = 50;

        this.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const distance = endX - startX;

            if (Math.abs(distance) >= THRESHOLD) {
                if (distance > 0) {
                    if (!this._isAnimating) {
                        this._currentAngleIndex--;
                        this._isAnimating = true;
                        this._updateMotion();
                        setTimeout(() => this._isAnimating = false, this._halfTransitionTime * 2);
                    }
                } else {
                    if (!this._isAnimating) {
                        this._currentAngleIndex++;
                        this._isAnimating = true;
                        this._updateMotion();
                        setTimeout(() => this._isAnimating = false, this._halfTransitionTime * 2);
                    }
                }
            }
        })
    }

    _initObserver() {
        const options = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0,
        };

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("intersecting");
                } else {
                    entry.target.classList.remove("intersecting");
                }
            });
        }, options);

        this._observer.observe(this.querySelector(".blurrable"), options);
    }

    _changeTitle(newHeader, newContent) {
        this._titleHeader.style.opacity = 0;
        this._titleContent.style.opacity = 0;
        this._titleHeader.setAttribute('title', escapeHTML(newHeader));
        this._titleContent.setAttribute('title', escapeHTML(newContent));
        setTimeout(() => {
            this._titleHeader.innerHTML = escapeHTML(newHeader);
            this._titleContent.innerHTML = escapeHTML(newContent);
            this._titleHeader.style.opacity = '0.65';
            this._titleContent.style.opacity = '0.33';
        }, this._halfTransitionTime);
    }

    _getZIndex(angleIndex) {
        // returns an integer z-index
        const cosValue = Math.cos(angleIndex * this._angleDiv);
        const rawZ = 1.5 * cosValue + 1.5;
        return Math.floor(rawZ);
    }

    _getPosition(angleIndex) {
        const raw = Math.sin(angleIndex * this._angleDiv);
        const mul = (this._size === 8) ? 120 : (75 + 10 * (this._size - 4))
        return raw * mul
    }

    _getScale(angleIndex) {
        // returns scale
        return 0.25 * (Math.cos(angleIndex * this._angleDiv) + 3);
    }

    _isNotFrontPicture(angleIndex) {
        return (angleIndex % this._size) ? 1 : 0;
    }

    _getTransitionFunction(angleIndex) {

        const distance = Math.abs(angleIndex);

        if (distance === 0) {
            return 'cubic-bezier(0.15, 0, 1, 1)';
        } else if (distance === 1) {
            return 'cubic-bezier(0, 0, 0.85, 1)';
        } else {
            return 'linear'
        }
    }

    _updateMotion() {
        const totalItems = this._images.length;

        this._images.forEach((image, index) => {

            let diff = index - this._currentAngleIndex;

            // relative index (from 0): this converts 0 1 2 3 4 5 6 -> 0 1 2 3 -3 -2 -1
            let angleIndex = (((diff + Math.floor(totalItems / 2)) % totalItems) + totalItems) % totalItems - Math.floor(totalItems / 2);

            if (angleIndex > Math.ceil((this._size - 1) / 2 ) || angleIndex < -Math.floor( (this._size - 1) / 2 )) {
                angleIndex = Math.ceil(this._size / 2);
                // the most distant element for N angles is ceil[N/2]
            }

            image.style.transition = `transform
                                      ${this._halfTransitionTime*2}ms
                                      ${this._getTransitionFunction(angleIndex)},
                                      
                                      filter
                                      ${this._halfTransitionTime*2}ms
                                      linear`;

            image.style.transform = `translate(${this._getPosition(angleIndex, 35)}%)
                                     scale(${this._getScale(angleIndex)})`;

            image.style.filter = `grayscale(${this._isNotFrontPicture(angleIndex)})`;

            if (!this._isNotFrontPicture(angleIndex)) {
                const imageObject = this._content[index];
                this._changeTitle(imageObject.title, imageObject.description);
                this._radios.forEach((radio) => {radio.classList.remove('active')});
                this._radios[index].classList.add('active');
            }

            setTimeout(() => image.style.zIndex = `${this._getZIndex(angleIndex)}`, this._halfTransitionTime);
        })
    }
}
customElements.define('carousel-block', CarouselBlock);
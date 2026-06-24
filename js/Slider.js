import {escapeHTML} from "./utils.js";

class SliderHero extends HTMLElement {

    constructor() {
        super();
        this._slidesData = [];
        this._currentSlide = 0;
        this._playbackTimer = null;
        this._isPlaying = false;
    }

    async connectedCallback() {

        const dataUrl = this.getAttribute("src");

        if (!dataUrl) {
            console.error("Could not find the data");
            this.innerHTML = "<p>Error: no data found</p>";
            return;
        }

        try {
            const response = await fetch(dataUrl);

            if (!response.ok) {
                throw new Error("Could not find the data");
            }

            this._slidesData = await response.json();

            this._render();
            this._activate();
            this._startPlayback();
        } catch (error) {
            console.error(error);
            this.innerHTML = "<p>Data processing error</p>";
        }
    };

    _render() {
        this.innerHTML = `
            <div class="dark slideshow">
                <div class="control-bar">
                    <div class="slide-control">
                        ${this._slidesData.map((item, index) => (`
                           <button class="${(index === 0) ? "radio active" : "radio"}"></button>
                        `)).join('')}
                    </div>
                    <button class="trans play-button">
                        <img src="/img/vector/playBackOn.svg" alt="play"/>
                    </button>
                </div>
                ${this._slidesData.map((slide, index) => `
                <div class="${(index === 0) ? "slide visible" : "slide"}">
                    <div class="width-wrapper">
                        <span class="s-like semi-trans">${escapeHTML(slide.dateText)}</span>
                        <h2>${escapeHTML(slide.headerText)}</h2>
                        <h5 class="semi-trans">${escapeHTML(slide.subheaderText)}</h5>
                        <a class="btn-normal" href=${escapeHTML(slide.buttonUrl)}>${escapeHTML(slide.buttonText)}</a>
                    </div>
                    <img draggable="false" src=${escapeHTML(slide.imageUrl)} alt=""/>
                </div>`).join('')}
            </div>
        `;
    }

    _activate() {
        this._slides = this.querySelectorAll('.slide');
        this._buttons = this.querySelectorAll('.radio');
        this._playButton = this.querySelector('.play-button');
        this._playButtonImage = this._playButton.querySelector('img');

        this._buttons.forEach((item, index) => item.addEventListener('click', () => this._handleSlideChange(index)));
        this._playButton.addEventListener('click', () => this._handlePlayButton());
    }

    _handleSlideChange(index) {
        this._currentSlide = index;
        this._slides.forEach((item) => item.classList.remove('visible'));
        this._slides[this._currentSlide].classList.add('visible');
        this._buttons.forEach((item) => item.classList.remove('active'));
        this._buttons[this._currentSlide].classList.add('active');
    }

    _startPlayback() {
        if (this._isPlaying) return;
        this._isPlaying = true;

        const step = () => {
            this._currentSlide = (this._currentSlide + 1) % this._slides.length;
            this._handleSlideChange(this._currentSlide);
            this._playbackTimer = setTimeout(step, 20000);
        }

        this._playbackTimer = setTimeout(step, 10000);
    }

    _stopPlayback() {
        this._isPlaying = false;
        clearTimeout(this._playbackTimer);
    }

    _handlePlayButton() {
        if (this._isPlaying) {
            this._stopPlayback();
            this._playButtonImage.src = "/img/vector/playBackOff.svg";
        } else {
            this._startPlayback();
            this._playButtonImage.src = "/img/vector/playBackOn.svg";
        }
    }
}

customElements.define('slider-hero', SliderHero);
export default SliderHero;

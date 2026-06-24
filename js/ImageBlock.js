import {escapeHTML} from "./utils.js";

class ImageBlock extends HTMLElement {
    constructor() {
        super();
        this._content = [];
        this._observer = null;

    }

    async connectedCallback() {

        const dataUrl = this.getAttribute('src');

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

            this._content = await response.json();
            this._render();
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
            <div class="light blurrable image-quotes-block">
                ${this._content.map((item, index) => (
                    `<section>
                        <div class="width-wrapper ${(index % 2 === 0) ? "image-left" : "image-right"}">
                            <div class="image-container">
                                <img src="${escapeHTML(item.imageSrc)}" draggable="false" alt="${escapeHTML(item.imageTitle)}"></img>
                            </div>
                            <div class="title-container">
                                <h4>${escapeHTML(item.title)}</h4>
                            </div>
                            <div class="text-container">
                                ${escapeHTML(item.description)}
                            </div>
                            <a class="btn-normal" href="${escapeHTML(item.buttonUrl)}">${escapeHTML(item.buttonText)}</a>
                        </div>
                    </section>`
                )).join('')}
            </div>
        `;
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
}

customElements.define('image-block', ImageBlock);
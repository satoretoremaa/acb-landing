import {escapeHTML} from "./utils.js";

class QuotesBlock extends HTMLElement {
    constructor() {
        super();
        this._content = [];
        this._observer = null;
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
            <div class="light">
                <div class="width-wrapper quotes">
                    ${this._content.map((quote, index) => (
                        `<div class="${index % 2 === 0 ? "quote left blurrable" : "quote right blurrable"}">
                            <h4 class="semi-trans">${escapeHTML(quote.header)}</h4>
                            <p>${escapeHTML(quote.bodyText)}</p>
                        </div>`)).join('')}
                    </div>
            </div>`;
    }

    _initObserver() {
        const options = {
            root: null,
            rootMargin: '-80px 0px 0px 0px',
            threshold: 1.0
        };

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {

                if (entry.isIntersecting && entry.intersectionRatio >= 0.99) {
                    entry.target.classList.add("intersecting");
                } else {
                    entry.target.classList.remove("intersecting");
                }
            });
        }, options);

        this.querySelectorAll('.blurrable').forEach(quote => this._observer.observe(quote));
    }
}

customElements.define('quotes-block', QuotesBlock);
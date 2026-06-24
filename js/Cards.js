import {escapeHTML} from "./utils.js";

class Cards extends HTMLElement {
    constructor() {
        super();
        this._buttonUrl = "";
        this._buttonText = "";
        this._blockHeader = "";
        this._observer = null;
        this._content = [];
    }

    async connectedCallback() {
        const dataUrl = this.getAttribute("src");
        this._buttonUrl = this.getAttribute("button-href");
        this._buttonText = this.getAttribute("button-text");
        this._blockHeader = this.getAttribute("title");

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
            <div class="dark">
                <div class="width-wrapper cards-block blurrable">
                    <h3>${escapeHTML(this._blockHeader)}</h3>
                    <a href=${escapeHTML(this._buttonUrl)} class="btn-normal">${escapeHTML(this._buttonText)}</a>
                    <div class="cards-container">
                        ${this._content.map((item, index) =>(
                            index < 3 ?
                            `<div class="card">
                                <div class="decorative">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span class="trans s-like">${escapeHTML(item.dateText)}</span>
                                <a href=${escapeHTML(item.url)} class="h4-like">${escapeHTML(item.headerText)}</a>
                                <p class="semi-trans">${escapeHTML(item.mainText)}</p>
                            </div>
                            ` : ""
                        )).join("")}
                    </div>
                </div>
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
        this.querySelectorAll(".card")
    }
}

customElements.define('cards-block', Cards);
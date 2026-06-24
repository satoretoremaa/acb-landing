import {escapeHTML} from "./utils.js";

class FooterMinimalistic extends HTMLElement {
    constructor() {
        super();
        this._content = []
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

        } catch (error) {
            console.error(error);
            this.innerHTML = "<p>Data processing error</p>";
        }
    }

    _render() {
        this.innerHTML = `
            <footer class="dark">
                <div class="width-wrapper">
                    <nav>
                        ${this._content.map((item) => (
                            `<a class="trans h5-like" href=${escapeHTML(item.linkHref)}>${escapeHTML(item.linkText)}</a>`
                        )).join('')}
                    </nav>
                    <span class="trans s-like">&copy; Demo version designed in Saint-Petersburg by satoremaa, 2026</span>
                </div>
            </footer>
        `
    }
}

customElements.define('footer-mini', FooterMinimalistic);
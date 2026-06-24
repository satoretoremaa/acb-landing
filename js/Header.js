import {escapeHTML} from "./utils.js";

class adaptiveHeader extends HTMLElement {
    constructor() {
        super();
        this._content = [];
        this._transparent = false;
    }

    async connectedCallback() {
        const dataUrl = this.getAttribute("src");
        this._transparent = this.getAttribute("transparent");

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
            this._applyBehavior();
        } catch (error) {
            console.error(error);
            this.innerHTML = "<p>Data processing error</p>";
        }
    }

    _render() {
        this.innerHTML = `
            <header>
                <div class="width-wrapper">
                    <nav class="desktop-nav">
                        ${this._content.map((item) => (
                            `<a class="semi-trans" href=${escapeHTML(item.linkHref)}>${escapeHTML(item.linkText)}</a>`    
                        )).join('')}
                        <button class="hamburger" id="headerMenuButton">
                            <svg width="27" height="22" viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.25 20.25L25.25 20.25M1.25 1.25H25.25M6.75 10.75H25.25" stroke-width="2.5" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </nav>
                </div>
                <div class="mobile-nav">
                    <div class="width-wrapper">
                        ${this._content.map((item) => (
                            `<a class="semi-trans h5-like" href=${escapeHTML(item.linkHref)}>${escapeHTML(item.linkText)}</a>`
                        )).join('')}
                    </div>
                </div>
            </header>`
    }

    _applyBehavior() {

        const header = this.querySelector('header');
        const button = this.querySelector('#headerMenuButton');
        const mobileNav = this.querySelector('.mobile-nav');
        const body = document.querySelector('body');

        if (this._transparent) {
            window.addEventListener('scroll', () => {
                (window.scrollY > 0) ? header.classList.add('scrolled') : header.classList.remove('scrolled');
            });
        } else {
            header.classList.add('scrolled');
        }

        button.addEventListener('click', () => {
            mobileNav.classList.toggle('visible');
            body.classList.toggle('non-scrollable')
        })
    }
}

customElements.define('adaptive-header', adaptiveHeader);
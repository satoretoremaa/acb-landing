import {escapeHTML} from "./utils.js";
import {MockServer} from "./MockServer.js";

class Form extends HTMLElement {
    constructor() {
        super();
        this._observer = null;

        this._content = [];
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
            this._showPassword();
            this._initObserver();
            this._applyRegistrationDefault();
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
            
            <div class="dark form-block">
                <img src="${escapeHTML(this._content.backgroundSrc)}" draggable="false"/>
            
                <div class="width-wrapper blurrable">
                    <form>
                        <div class="decorative">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    
                        <h3>${this._content.title}</h3>
                        ${this._content.requiredFields ? this._content.requiredFields.map((elem) => (
                            `<input class="dark p-like" type="text" name=${escapeHTML(elem.name)} required placeholder="${escapeHTML(elem.placeholder)}"/>`
                        )).join("") : ""}
                        
                        ${this._content.optionalFields ? this._content.optionalFields.map((elem) => (
                            `<input class="dark p-like" type="text" name=${escapeHTML(elem.name)} placeholder="${escapeHTML(elem.placeholder)}*"/>`
                        )).join("") : ""} 
                        
                        ${this._content.emailField ? `<input class="dark p-like" type="email" name="userEmail" required value="" placeholder="e-mail"/>` : ""}
                        ${this._content.passwordField ? `<input class="dark p-like" type="password" name="userPassword" id="passwordField" required value="" placeholder="password"/>` : ""}
                        
                        
                        
                        <div class="checkbox-container">
                        
                            ${this._content.optionalFields ? '<span class="trans s-like">* optional fields</span>' : ""}
                            
                            ${this._content.passwordField ? `
                                <label id="showPassword">
                                    <input type="checkbox"/>
                                    <div class="pseudo-slider"></div>
                                    <span class="s-like">Show password</span>
                                </label>` : ""
                            }
                            
                            ${this._content.checkboxes.map((elem) => (`
                                <label>
                                    <input type="checkbox" name=${escapeHTML(elem.name)}/>
                                    <div class="pseudo-slider"></div>
                                    <span class="s-like">${escapeHTML(elem.label)}</span>
                                </label>`
                            )).join("")}
                            
                        </div>
                        <button class="btn-normal" type="submit">${this._content.submitTitle}</button>    
                    </form>
                </div>
                <div class="notification">
                </div>
            </div>`
    }

    _applyRegistrationDefault() {
        const server = new MockServer();
        const form = this.querySelector("form");
        const submitBtn = this.querySelector("button");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            submitBtn.disabled = true;
            this._wait(true);
            const formData = new FormData(form);
            const response = await server.post('/api/register', formData);

            this._wait(false);
            submitBtn.disabled = false;

            if (response.ok) {
                this._notify(`<h5 class="semi-trans">Registration success</h5><span class="s-like trans">Click here to hide</span>`);
            } else {
                this._notify(`<h5 class="semi-trans">Registration error</h5><p>${response.message}</p><span class="s-like trans">Click here to hide</span>`);
            }

            form.reset();
        });
    }

    _showPassword() {
        if (!this._content.passwordField) return;

        const passwordButton = this.querySelector("#showPassword");
        const passwordField = this.querySelector("#passwordField");

        passwordButton.addEventListener("change", e => {
            if (e.target.checked) {
                passwordField.setAttribute("type", "text")
            } else {
                passwordField.setAttribute("type", "password")
            }
        });
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

    _wait(bool) {
        if (bool) {
            this._notify(`<div class="spinner"></div><p class="semi-trans">Please, wait</p>`, true);
        } else {
            this._notify(``, true)
        }
    }

    _notify(content, preventQuit=false) {
        const notification = this.querySelector(".notification");
        const form = this.querySelector("form");

        notification.innerHTML = content;
        notification.classList.add("visible");
        form.classList.add("disabled");

        if (!preventQuit) {
            const handleClick = (e) => {
                e.preventDefault();
                notification.classList.remove('visible');
                form.classList.remove("disabled");
                notification.innerHTML = ``
            }

            notification.addEventListener("click", e => handleClick(e));

            return () => notification.removeEventListener("click", e => handleClick(e));
        }
    }
}

customElements.define('form-block', Form);
/* eslint-disable no-undef */

class HakunekoStart extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-start";
    }

    /**
     *
     */
    static get properties() {
        return {};
    }

    /**
     *
     */
    async ready() {
        super.ready();
    }

    /**
     * 
     */
    i18n(key, def) {
        return Engine.I18n.translate(key, def);
    }
}

window.customElements.define(HakunekoStart.is, HakunekoStart);

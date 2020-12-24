class HakunekoTheme extends Polymer.Element {
    static get is() {
        return "hakuneko-theme";
    }

    ready() {
        super.ready();
    }
}

window.customElements.define(HakunekoTheme.is, HakunekoTheme);

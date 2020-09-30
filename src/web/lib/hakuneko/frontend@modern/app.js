/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class HakunekoApp extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-app";
    }

    /**
     *
     */
    ready() {
        super.ready();
        this.loadingMessage = quotes[Math.floor(Math.random() * quotes.length)];
        // load settings in case UI was not ready when the settings were loaded and event was fired
        this.readerEnabled = Engine.Settings.readerEnabled.value;
        Engine.Settings.addEventListener(
            "saved",
            this.onSettingsSaved.bind(this)
        );
    }

    /**
     *
     */
    getAppearance() {
        let appearance = "";
        appearance +=
            localStorage.getItem("themeColor") !== null
                ? `${localStorage.getItem("themeColor")}`
                : "";

        appearance +=
            localStorage.getItem("corner") !== null
                ? ` ${localStorage.getItem("corner")}`
                : "";

        return appearance;
    }

    /**
     *
     */
    getControlClass(index) {
        return index < 0 ? "show" : "hide";
    }

    /**
     *
     */
    getMangaListStyle(readerEnabled) {
        return readerEnabled ? "width: 15rem;" : "flex: 1; max-width: 50%;";
    }

    /**
     *
     */
    getChapterListStyle(readerEnabled) {
        return readerEnabled ? "width: 15rem;" : "flex: 1; max-width: 50%;";
    }

    /**
     *
     */
    getPagePanelStyle(readerEnabled, chapter) {
        return !readerEnabled || chapter === undefined ? "display: none;" : "";
    }

    /**
     *
     */
    getStartPanelStyle(readerEnabled, chapter) {
        return !readerEnabled || chapter !== undefined ? "display: none;" : "";
    }

    /**
     *
     */
    onSettingsSaved(event) {
        this.readerEnabled = Engine.Settings.readerEnabled.value;
    }
}
window.customElements.define(HakunekoApp.is, HakunekoApp);

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
class HakunekoMenu extends Polymer.Element {
    static get is() {
        return "hakuneko-menu";
    }

    static get properties() {
        return {};
    }

    ready() {
        super.ready();
        this.year = new Date().getFullYear();
        this.version = Engine.Version;
        this.popupVisibility = false;
        this.popupVisibilityAppearance = false;
        this.settingCategories = Engine.Settings.getCategorizedSettings();
        this.corners = [
            {
                label: this.i18n('settings.corners.straight'),
                class: "square",
                value: "corner__square",
            },
            {
                label: this.i18n('settings.corners.rounded'),
                class: "rounded",
                value: "corner__rounded",
            },
        ];

        this.themes = [
            { label: this.i18n('settings.colors.red'), value: "red", color: "#F44336" },
            { label: this.i18n('settings.colors.pink'), value: "pink", color: "#E91E63" },
            { label: this.i18n('settings.colors.purple'), value: "purple", color: "#9C27B0" },
            { label: this.i18n('settings.colors.dpurple'), value: "dpurple", color: "#673AB7" },
            { label: this.i18n('settings.colors.indigo'), value: "indigo", color: "#3F51B5" },
            { label: this.i18n('settings.colors.blue'), value: "blue", color: "#2196F3" },
            { label: this.i18n('settings.colors.cian'), value: "cian", color: "#00BCD4" },
            { label: this.i18n('settings.colors.teal'), value: "teal", color: "#009688" },
            { label: this.i18n('settings.colors.green'), value: "green", color: "#4CAF50" },
            { label: this.i18n('settings.colors.lgreen'), value: "lgreen", color: "#8BC34A" },
            { label: this.i18n('settings.colors.lime'), value: "lime", color: "#CDDC39" },
            { label: this.i18n('settings.colors.yellow'), value: "yellow", color: "#FFEB3B" },
            { label: this.i18n('settings.colors.amber'), value: "amber", color: "#FFC107" },
            { label: this.i18n('settings.colors.orange'), value: "orange", color: "#FF9800" },
            { label: this.i18n('settings.colors.dorange'), value: "dorange", color: "#FF5722" },
        ];

        this.languages = [
            { label: this.i18n('settings.languages.english'), value: 'en'},
            { label: this.i18n('settings.languages.spanish'), value: 'es'},
        ]
    }

    getLanguageSelected(value) {
        return localStorage.getItem("lang") === value ? "selected" : "";
    }

    getCornerSelected(value) {
        return localStorage.getItem("corner") === value ? "selected" : "";
    }

    getThemeSelected(theme) {
        return localStorage.getItem("themeColor") === theme ? "selected" : "";
    }

    getPopupClass(visibility) {
        return visibility ? "show" : "hide";
    }

    getPopupClassAppearance(visibility) {
        return visibility ? "show" : "hide";
    }

    async togglePopup() {
        let visible = !this.popupVisibility;
        if (visible) {
            this.set(
                "settingCategories",
                Engine.Settings.getCategorizedSettings()
            );
        } else {
            this.set("settingCategories", []);
        }
        this.set("popupVisibility", visible);
    }

    async togglePopupAppearance() {
        let visible = !this.popupVisibilityAppearance;
        this.set("popupVisibilityAppearance", visible);
    }

    closeDiscardChanges() {
        Engine.Settings.load();
        this.set("settingCategories", []);
        this.set("popupVisibility", false);
    }

    closeSaveChanges() {
        Engine.Settings.save();
        this.set("settingCategories", []);
        this.set("popupVisibility", false);
    }

    setLanguage(e) {
        localStorage.setItem("lang", e.model.item.value);
        this.windowReload();
    }

    setTheme(e) {
        localStorage.setItem("themeColor", e.model.item.value);
        this.windowReload();
    }

    setCorner(e) {
        localStorage.setItem("corner", e.model.item.value);
        this.windowReload();
    }

    windowReload() {
        window.location.reload();
    }

    /**
     * Open a new window and always disable the "Stay or Leave" confirmation,
     * otherwise the window cannot be closed anymore (electron does not show the confirmation).
     */
    openWindow(event) {
        let popup = window.open(
            event.target.dataset.href,
            "",
            "frame=true,nodeIntegration=no"
        );
        // disable onbeforeunload periodically (in case of navigation) to prevent blocking window close
        let watchdog = setInterval(() => {
            if (popup.closed) {
                clearInterval(watchdog);
            } else {
                let script = `
              // loal scope for variable declaration
              {
                  window.onbeforeunload = evt => undefined;
                  let warning = document.querySelector('div.unsupported-browser');
                  if(warning) {
                      warning.parentNode.removeChild(warning);
                  }
                  let signup = document.querySelector('div.signup-prompt');
                  if(signup) {
                      signup.parentNode.removeChild(signup);
                  }
              }
          `;
                popup.eval(script);
            }
        }, 500);
    }

    import(event) {
        this.$.importFile.click();
    }

    onImport(event) {
        try {
            Engine.BookmarkManager.importBookmarks(event.target.files[0]);
        } catch (error) {
            alert(error.message);
        } finally {
            // reset input file field or it cannot be used again
            this.$.importFile.value = null;
        }
    }

    /**
    * 
    */
    i18n(key, def) {
        return Engine.I18n.translate(key, def);
    }
}
window.customElements.define(HakunekoMenu.is, HakunekoMenu);

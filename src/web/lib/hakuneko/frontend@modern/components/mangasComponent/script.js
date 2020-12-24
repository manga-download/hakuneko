/* eslint-disable no-undef */
/* eslint-disable no-self-assign */
/* eslint-disable no-unused-vars */

class HakunekoMangas extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-mangas";
    }

    /**
     *
     */
    static get properties() {
        return {
            selectedConnector: {
                type: Object,
                value: undefined,
                notify: true, // enable upward data flow,
                //readOnly: true, // prevent downward data flow
                observer: "onSelectedConnectorChanged",
            },
            selectedManga: {
                type: Object,
                value: undefined,
                notify: true, // enable upward data flow,
                //readOnly: true, // prevent downward data flow
                observer: "onSelectedMangaChanged",
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        // the bookmark connector which is required for some exceptional handling
        this.bookmarkConnectorID = "bookmarks";
        // currently active manga list
        this.mangaList = this["mangaList"];
        // register callbacks for published events
        document.addEventListener(
            EventListener.onMangaStatusChanged,
            this.onMangaStatusChanged.bind(this)
        );
        Engine.BookmarkManager.addEventListener(
            "changed",
            this.onBookmarksChanged.bind(this)
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
     * Observer will be executed, whenever the 'selectedConnector' is changed.
     */
    onSelectedConnectorChanged(connector) {
        this.set("selectedManga", undefined);
        if (!connector) {
            this.set("mangaList", undefined);
            return;
        }
        let statusID = this.$.status.addToQueue(
            "Loading manga list (" + connector.label + ")"
        );
        // set to undefined when switching manga list prevents a bug in iron-list (high CPU usage)
        this.set("mangaList", []);
        connector.getMangas((error, mangas) => {
            // check if executing connector is still the selected connector (visible)
            if (connector === this.selectedConnector) {
                this.set("mangaList", mangas);
            }
            this.$.status.removeFromQueue(statusID);
        });
    }

    /**
     * Event listener attached to the corresponding refresh button element.
     */
    onUpdateMangaListClick(e) {
        let connector = this.selectedConnector;
        if (!connector || connector.isUpdating) {
            return;
        }
        let statusID = this.$.status.addToQueue(
            `${this.i18n('mangas.update_manga_list')} (${connector.label})`
        );
        connector.updateMangas((error, mangas) => {
            // check if executing connector is still the selected connector (visible)
            if (connector === this.selectedConnector) {
                if (!error) {
                    this.set("mangaList", mangas);
                }

                // trigger update for refresh button style (update completed)
                this.notifyPath("selectedConnector.isUpdating");
            }
            this.$.status.removeFromQueue(statusID);
            if (error) {
                alert(
                    `${this.i18n('mangas.failed_update_manga_list')} ${connector.label} \n\n ${error.message}`,
                    `${this.i18n('general.title_application ')} ${connector.label}`,
                    "error"
                );
            }
        });
        // trigger update for refresh button style (update started)
        this.notifyPath("selectedConnector.isUpdating");
    }

    /**
     *
     */
    existMangasForValidConnector(connector, mangaCount) {
        return (
            connector &&
            connector.id !== this.bookmarkConnectorID &&
            (!mangaCount || mangaCount < 1)
        );
    }

    /**
     * Event listener attached to the corresponding <li> element.
     * When the element is clicked, the corresponding manga from 'mangaList' will be assigned to 'selectedManga'.
     */
    onMangaClicked(e) {
        this.set("selectedManga", e.model.item);
        document.dispatchEvent(
            new CustomEvent(EventListener.onSelectManga, {
                detail: e.model.item,
            })
        );
    }

    /**
     * Observer will be executed, whenever the 'selectedManga' is changed.
     */
    onSelectedMangaChanged(manga) {
        //
    }

    /**
     *
     */
    getMangaClass(selectedManga, id) {
        return !selectedManga || selectedManga.id !== id ? "" : "focus";
    }

    /**
     *
     */
    getRefreshClass(isUpdating) {
        return isUpdating
            ? "mdi-loading mdi-spin disabled"
            : "mdi-sync mdi-flip-v";
    }

    /**
     *
     */
    filterMangas(pattern) {
        let isLatin = /^[a-zA-Z0-9]+$/.test(pattern);
        let threshold = isLatin ? 3 : 2;
        if (!pattern || pattern.length < threshold) {
            return null;
        }
        let p = pattern.toLowerCase();
        return (manga) => {
            return (
                manga.title.toLowerCase().includes(p) ||
                manga.connector.label.toLowerCase().includes(p)
            );
        };
    }

    /**
     *
     */
    onMangaStatusChanged(e) {
        let manga = e.detail;
        if (
            !this.mangaList ||
            !this.selectedConnector ||
            this.selectedConnector.id !== this.bookmarkConnectorID &&
                this.selectedConnector.id !== manga.connector.id
        ) {
            return;
        }
        let index = this.mangaList.findIndex((item) => {
            // mangas may be different objects (synchronizing connector list) but still be equivalent
            // => comparing ids instead of comparing the objects directly
            return item.id === manga.id;
        });
        if (index > -1) {
            this.notifyPath("mangaList." + index + ".status");
        }
    }

    /**
     *
     */
    onBookmarksChanged(e) {
        if (this.selectedConnector.id === this.bookmarkConnectorID) {
            this.onSelectedConnectorChanged(this.selectedConnector);
        }
    }

    /**
     *
     */
    onPasteClick(evt) {
        let bool = true;
        let clipboardConnector = Engine.Connectors.find(
            (connector) => connector.id === "clipboard"
        );
        if (bool /*clipboard seems to have valid manga links*/) {
            this.set("selectedConnector", clipboardConnector);
            this.onUpdateMangaListClick(evt);
        }
    }

    /**
    * 
    */
    i18n(key, def) {
        return Engine.I18n.translate(key, def);
    }
}
window.customElements.define(HakunekoMangas.is, HakunekoMangas);

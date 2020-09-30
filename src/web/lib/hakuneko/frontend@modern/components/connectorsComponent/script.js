/* eslint-disable no-undef */
class HakunekoConnectors extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-connectors";
    }

    /**
     *
     */
    static get properties() {
        return {
            selectedConnector: {
                type: Object,
                value: Engine.Connectors[0],
                notify: true, // enable upward data flow,
                //readOnly: true // prevent downward data flow
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        this.popupVisibility = false;
        // list of all available connectors
        this.connectorList = [];
        // load connectors
        this.set("connectorList", Engine.Connectors);
        this.tags = this.getAvailableTags();
        this.selectedTags = [];
    }

    /**
     *
     */
    getAvailableTags() {
        let tags = this.connectorList.reduce((accumulator, connector) => {
            let newTags = connector.tags.filter(
                (t) => !accumulator.includes(t)
            );
            return accumulator.concat(newTags);
        }, []);
        // SET removes duplicates
        return [...new Set(tags)].sort().map((t) => {
            return {
                tag: t,
                selected: false,
            };
        });
    }

    /**
     *
     */
    getPopupClass(visibility) {
        return visibility ? "show" : "hide";
    }

    /**
     *
     */
    showPopup() {
        //this.clearFilters();
        this.set("popupVisibility", true);
        //this.set( 'connectorPattern', '' );
        this.$.connectorPattern.select();
        this.$.connectorPattern.focus();
    }

    /**
     *
     */
    closePopup() {
        this.set("popupVisibility", false);
    }

    /**
     *
     */
    selectConnector(evt) {
        this.set("selectedConnector", evt.model.item);
        document.dispatchEvent(
            new CustomEvent(EventListener.onSelectConnector, {
                detail: evt.model.item,
            })
        );
        this.closePopup();
    }

    /**
     *
     */
    _openLink(evt, link) {
        if (link) {
            let popup = window.open(
                link,
                evt.model.label,
                "frame=true,nodeIntegration=no"
            );
            // disable onbeforeunload periodically (in case of navigation) to prevent blocking window close
            let watchdog = setInterval(() => {
                if (popup.closed) {
                    clearInterval(watchdog);
                } else {
                    popup.eval(`window.onbeforeunload = evt => undefined;`);
                }
            }, 500);
        }
        evt.cancelBubble = true;
        evt.stopPropagation();
    }

    /**
     *
     */
    openWebsite(evt) {
        let item = evt.model.item;
        this._openLink(evt, item.url);
    }

    /**
     *
     */
    openLogin(evt) {
        let links = evt.model.item.links;
        this._openLink(evt, links ? links.login : undefined);
    }

    /**
     *
     */
    openDonation(evt) {
        let links = evt.model.item.links;
        this._openLink(evt, links ? links.donation : undefined);
    }

    /**
     *
     */
    toggleTag(event) {
        event.model.item.selected = !event.model.item.selected;
        this.set(
            "selectedTags",
            this.tags.filter((tag) => tag.selected)
        );
    }

    /**
     *
     */
    filterConnectors(pattern, tags) {
        let p = (pattern || "").toLowerCase();
        return (connector) => {
            let patternMatch =
                !pattern ||
                (connector.id + connector.label + connector.url)
                    .toLowerCase()
                    .includes(p);
            let tagsMatch =
                tags.filter((t) => !connector.tags.includes(t.tag)).length < 1;
            return patternMatch && tagsMatch;
        };
    }

    /**
     *
     */
    filterConnectorsByManga(evt) {
        if (
            evt.keyCode !== 13 ||
            this.$.mangaPattern.disabled /*this.isMangaFilterButtonDisabled*/
        ) {
            return;
        }

        this.$.mangaPattern.disabled = true;
        let promises = Engine.Connectors.map((connector) => {
            if (typeof connector.findMatchingManga === "function") {
                return connector
                    .findMatchingManga(this.mangaPattern)
                    .then((result) =>
                        result
                            ? Promise.resolve(connector)
                            : Promise.resolve(undefined)
                    );
            } else {
                return Promise.resolve(undefined);
            }
        });

        Promise.all(promises)
            .then((values) => {
                this.$.mangaPattern.disabled = false;
                this.$.mangaPattern.focus();
                this.set(
                    "connectorList",
                    values.filter((c) => !!c)
                );
            })
            .catch((error) => {
                this.$.mangaPattern.disabled = false;
                console.error(error);
            });
    }

    /**
     *
     */
    clearFilters() {
        this.tags.forEach((tag) => tag.selected = false);
        this.set("connectorList", Engine.Connectors);
        this.set("mangaPattern", "");
        this.set("connectorPattern", "");
        this.set("selectedTags", []);
    }

    /**
     *
     */
    getConnectorClass(selectedConnector, connector) {
        return selectedConnector === connector ? "cardSelected" : "";
    }

    /**
     *
     */
    getTagClass(selectedTags, tag) {
        return selectedTags.includes(tag) ? "tagSelected" : "";
    }

    /**
     *
     */
    getLoginClass(links) {
        return links && links.login ? "active" : "disabled";
    }

    /**
     *
     */
    getDonationClass(links) {
        return links && links.donation ? "active" : "disabled";
    }
}
window.customElements.define(HakunekoConnectors.is, HakunekoConnectors);

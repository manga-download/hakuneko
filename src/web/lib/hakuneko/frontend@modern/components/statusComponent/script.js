/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class HakunekoStatus extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-status";
    }

    /**
     *
     */
    static get properties() {
        return {
            message: {
                type: String,
                value: "",
                notify: true, // enable upward data flow,
                //readOnly: true, // prevent downward data flow
                //observer: 'onSelectedMangaChanged'
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        this.queue = [];
    }

    /**
     *
     */
    getStatusClass(trigger) {
        return this.queue.length > 0 ? "show" : "hide";
    }

    /**
     *
     */
    getQueueContent(trigger) {
        return this.queue
            .map(function (item) {
                return item.text;
            })
            .join("\n");
    }

    /**
     *
     */
    addToQueue(text) {
        let id = Symbol(text);
        this.push("queue", { id: id, text: text });
        return id;
    }

    /**
     *
     */
    removeFromQueue(id) {
        let index = this.queue.findIndex((item) => {
            return id === item.id;
        });
        if (index > -1) {
            this.splice("queue", index, 1);
        }
    }
}
window.customElements.define(HakunekoStatus.is, HakunekoStatus);

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class HakunekoInput extends Polymer.Element {
    /**
     *
     */
    static get is() {
        return "hakuneko-input";
    }

    /**
     *
     */
    static get properties() {
        return {
            item: {
                type: Object,
                value: undefined,
                notify: true, // enable upward data flow,
                //readOnly: true, // prevent downward data flow
            },
        };
    }

    /**
     *
     */
    ready() {
        super.ready();
        //
        this.inputTypes = {
            disabled: "disabled",
            text: "text",
            password: "password",
            numeric: "numeric",
            select: "select",
            checkbox: "checkbox",
            file: "file",
            directory: "directory",
        };
    }

    /**
     *
     */
    isInputType(inputType, expectedType) {
        return inputType === expectedType;
    }

    /**
     *
     */
    isSelected(selected, option) {
        return selected === option;
    }
    /**
     *
     */
    clickChooseFile(e) {
        console.log(this.item);
    }

    /**
     *
     */
    async clickChooseDirectory(evt) {
        let path = await Engine.Storage.folderBrowser(this.item.value);
        if (path) {
            this.set("item.value", path);
        }
    }

    /**
    * 
    */
    i18n(key, def) {
        return Engine.I18n.translate(key, def);
    }
}
window.customElements.define(HakunekoInput.is, HakunekoInput);

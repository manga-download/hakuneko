export default class I18n {
    constructor() {
        this.fs = require("fs");
        this.path = require("path");
        this.lang =
            localStorage.getItem("lang") === null
                ? "es"
                : localStorage.getItem("lang");
        this.dic = undefined;
    }

    getDictionary(url) {
        return new Promise((response, reject) => {
            this.fs.readFile(url, "utf-8", (err, data) => {
                try {
                    if (err) {
                        throw err;
                    }
                    const result = JSON.parse(data);
                    this.dic = result;
                    response(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    translate(key, def = '') {
        const tmpContext = key.split(".");
        var translate = this.dic;
        while (tmpContext.length !== 0) {
            translate = translate[tmpContext[0]];
            tmpContext.shift();
        }
        return translate === undefined ? def : translate;
    }
}

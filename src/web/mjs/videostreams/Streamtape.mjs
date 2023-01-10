export default class Streamtape {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
        const script = `
            new Promise(resolve => {
                resolve(document.getElementById('robotlink').textContent.trim());
            });
        `;
        const request = new Request(this._uri);
        const data = await Engine.Request.fetchUI(request, script);
        return new URL(data, this._uri).href;
    }
}

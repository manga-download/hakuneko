export default class Streamtape {

    constructor(url, fetchDOM) {
        this._uri = new URL(url);
        this._fetchDOM = fetchDOM;
    }

    async getStream() {
        let request = new Request(this._uri);
        let data = await this._fetchDOM(request, 'div#videolink');
        return new URL(data[0].textContent.trim(), request.url).href;
    }
}
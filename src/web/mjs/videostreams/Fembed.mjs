export default class Fembed {
    constructor(url) {
        this._uri = new URL(url);
    }
    async getStream() {
        const videoid = this._uri.href.match(/\/v\/([\S]+)$/)[1];
        const request = new Request(new URL('/api/source/'+videoid, this._uri.origin), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-referer' : this._uri,
                'x-origin' : this._uri.origin,
                'X-Requested-With' : 'XMLHttpRequest',
            },
            body: new URLSearchParams({
                'r': '',
                'd': 'embedsito.com',
            }).toString()
        });
        const response = await fetch(request);
        const data = await response.json();
        return data.data[0].file; ///*TODO : choose stream quality
    }
}
export default class Mav {
    constructor(originwebsite, url) {
        this._uri = new URL(url);
        this.hostname = this._uri.hostname;
        this.videoid = url.match(/\/v\/([\S]+)/)[1];
        this.website = originwebsite;
    }
    async getStream(resolution) {
        const uri = new URL('/api/source/'+this.videoid, this._uri.origin);
        const body = {
            'r': this.website,
            'd': this.hostname,
        };
        const request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'x-origin': this._uri.origin,
                'x-referer': this._uri,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Alt-Used': this.hostname,
            }
        });
        const response = await fetch(request);
        const data = await response.json();
        let vid = data.data.find(element => element.label == resolution);
        vid = !vid ? data.data[0] : vid;

        return {
            file : vid.file,
            type : vid.type
        };
    }
}

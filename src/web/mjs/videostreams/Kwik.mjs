export default class Kwik {

    constructor(url, referer) {
        this._uri = new URL(url);
        this._referer = new URL(referer);
    }

    async getPlaylist(/*resolution*/) {
        let script = `new Promise(resolve => resolve(hls.url));`;
        let request = new Request(this._uri.href.replace('/f/', '/e/'), {});
        request.headers.set('x-referer', this._referer.href);
        return Engine.Request.fetchUI(request, script);
    }

    // TODO: implementation incomplete (using playlist for now, as 'kwik/f/...' requires hCaptcha => inconvenient)
    async getStream(/*resolution*/) {
        throw new Error('Not implemented!');
        /*
        let script = `
            new Promise(async (resolve, reject) => {
                let form = $('div.download-form form');
                resolve({
                    url: form.attr('action')
                    method: form.attr('method'),
                    //redirect: 'manual',
                    body: form.serialize(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            });
        `;
        let request = new Request(this._uri.href.replace('/e/', '/f/'), {});
        request = await Engine.Request.fetchUI(request, script);
        let response = await fetch(request);
        let location = (await response).headers.get('location');
        let data = await response.text();
        */
    }
}
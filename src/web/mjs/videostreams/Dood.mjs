export default class Dood {
    constructor(url) {
        this._uri = new URL(url);
    }
    async getStream() {
        let script = `
        new Promise(resolve => {
            resolve({
                tok : makePlay(), doc : document.documentElement.innerHTML
            });
        });
        `;
        let request = new Request(this._uri);
        const data = await Engine.Request.fetchUI(request, script, 30000);
        //end of final video url
        const videoUrlEnd = data.tok;
        //get the url for requestion the video url beginning
        let dom = (new DOMParser).parseFromString(data.doc, "text/html");
        const requestThing = dom.documentElement.innerHTML.match(/(\/pass_md5\S+)'/)[1];
        const url = new URL(requestThing, 'https://dood.wf');
        request = new Request(url);
        request.headers.set('x-referer', this._uri);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        const response = await fetch(request);
        let videoLink = await response.text();
        return videoLink + videoUrlEnd;
    }
}

import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RealmScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'realmscans';
        super.label = 'RealmScans';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://realmscans.xyz';
        this.path = '/series';
    }

    async _getMangas() {
        const request = new Request(new URL(this.path, this.url), this.requestOptions);
        const script = `
            new Promise((resolve) => {
                setTimeout(() => {
                    let mangalist = [...document.querySelectorAll('div.bsx a')].map(element => {
                        return {
                            id: element.pathname,
                            title: element.querySelector('div.tt').textContent.trim()
                        };
                    });
                   resolve(mangalist);
                },2500); 
            });
        `;
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        const data = await super._getPages(chapter);
        return data.map(element => this.createConnectorURI(element));
    }
    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}

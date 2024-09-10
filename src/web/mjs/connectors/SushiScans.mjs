import WordPressMangastream from './templates/WordPressMangastream.mjs';
import HeaderGenerator from '../engine/HeaderGenerator.mjs';

export default class SushiScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sushiscans';
        super.label = 'Sushi Scans';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://sushiscan.net';
        this.path = '/catalogue/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(ts_reader.params.sources.shift().images);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        data = data.filter(link => !link.includes('histats.com'));

        // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
        return data.map(link => this.createConnectorURI(this.getAbsolutePath(link, request.url).replace(/\/i\d+\.wp\.com/, '')));
    }

    async _handleConnectorURI(payload) {
        await this.wait(1500);
        let request = new Request(payload, this.requestOptions);
        request.headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8');
        request.headers.set('x-user-agent', HeaderGenerator.randomUA());
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}

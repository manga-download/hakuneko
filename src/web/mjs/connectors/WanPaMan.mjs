import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OnePunchMan extends Connector {

    constructor() {
        super();
        super.id = 'wanpaman';
        super.label = 'Wan-Pa Man';
        this.tags = [ 'manga', 'japanese'];
        this.url = 'http://galaxyheavyblow.web.fc2.com';
    }

    async _getMangas() {
        return [
            {
                id: this.url,
                title: this.label
            }
        ];
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id), this.requestOptions);
        let script = `new Promise(resolve => {
            let chapters = [...document.querySelectorAll('body a[href*="imageviewer"]')].map(link => {
                return {
                    id: link.href,
                    title: link.text.trim()
                };
            });
            resolve(chapters.reverse());
        });`;

        return Engine.Request.fetchUI( request, script );
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let rest = [uri.pathname+uri.searchParams.get('aid')];
        rest.push(uri.searchParams.get('iid'));
        rest.push( 'metadata.json?_=' + Date.now() );

        let request = new Request( new URL(rest.join('/'), this.url), this.requestOptions );
        let data = await this.fetchJSON(request);

        return data.imageItemList.map(page => {
            rest.pop();
            rest.push(page.fileName);
            return this.getAbsolutePath(rest.join('/'), this.url);
        });

    }

    async _getMangaFromURI() {
        return new Manga(this, this.url, this.label);
    }
}
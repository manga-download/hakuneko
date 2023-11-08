import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FlameScansORG extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'flamescans-org';
        super.label = 'Flame Comics';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://flamecomics.com';
        this.path = '/series/list-mode/';
        this.queryMangas = 'div.postbody div.soralist ul li a.series';
        this.queryChapters = 'div#chapterlist ul li a';
    }

    async _getPages(chapter) {
        const url = new URL(chapter.id, this.url);
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.composed_figure');
        if (data.length == 0) return (await super._getPages(chapter)).filter(page => !page.includes('readonflamescans.png'));

        //need to combine pictures
        return data.map(page => {
            const images = [...page.querySelectorAll('source')].map(image => image.getAttribute('src'));
            return this.createConnectorURI({ images : images });
        });
    }

    async _handleConnectorURI(payload) {
        const promises = payload.images.map(async part => {
            const request = new Request(part, this.requestOptions);
            request.headers.set('x-referer', this.url);
            const response = await fetch(request);
            const data = await response.blob();
            return createImageBitmap(data);
        });
        const bitmaps = await Promise.all(promises);
        const data = await this.composePuzzle(bitmaps);
        return this._blobToBuffer(data);
    }

    async composePuzzle(bitmaps) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            //combine 2 pictures
            const b1 = bitmaps[0];
            const b2 = bitmaps[1];
            canvas.width = b1.width+b2.width;
            canvas.height = b1.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(b1, 0, 0);
            ctx.drawImage(b2, b1.width, 0);
            canvas.toBlob(data => {
                resolve(data);
            },
            Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }
}

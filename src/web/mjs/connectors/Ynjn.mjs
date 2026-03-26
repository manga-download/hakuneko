import Manga from '../engine/Manga.mjs';
import Connector from '../engine/Connector.mjs';

export default class YnJn extends Connector {

    constructor() {
        super();
        super.id = 'ynjn';
        super.label = 'ヤンジャン！(ynjn)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://ynjn.jp';
        this.apiUrl = 'https://webapi.ynjn.jp';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/').pop();
        const request = new Request(new URL(`book/${id}`, this.apiUrl), this.requestOptions);
        const json = await this.fetchJSON(request);
        const title = json.data.book.name;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const chapters = [];
        for (let page = 1, hasNext = true; hasNext; page++) {
            const uri = new URL(`title/${manga.id}/episode?isGetAll=true`, this.apiUrl);
            uri.searchParams.set('id', manga.id);
            uri.searchParams.set('page', page);
            uri.searchParams.set('is_reverse', 'false');
            const request = new Request(uri, this.requestOptions);
            const json = await this.fetchJSON(request);
            json.data.episodes.forEach(episode => {
                chapters.push({
                    id: episode.id,
                    title: episode.name,
                });
            });
            hasNext = json.data.has_next;
        }
        return chapters;
    }

    async _getPages(chapter) {
        let pages = [];
        const uri = new URL('/viewer', this.apiUrl);
        uri.searchParams.set('title_id', chapter.manga.id);
        uri.searchParams.set('episode_id', chapter.id);
        const request = new Request(uri, this.requestOptions);
        const json = await this.fetchJSON(request);

        pages = json.data.pages
            .filter(page=> page.manga_page)
            .map(page => this.createConnectorURI(page.manga_page.page_image_url ));
        return pages;
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(payload, this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);

        let data = await response.blob();
        data = await this._descrambleImage(data);
        return this._blobToBuffer(data);
    }

    async _descrambleImage(data) {
        let bitmap = await createImageBitmap(data);
        return new Promise(resolve => {

            let canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            const imageWidth = bitmap.width;
            const imageHeight = bitmap.height;
            const blockWidth = Math.floor(imageWidth / 4);
            const blockHeight = Math.floor(imageHeight / 4);
            ctx.clearRect(0, 0, imageWidth, imageHeight);
            ctx.drawImage(bitmap, 0, 0, imageWidth, imageHeight);
            let y = undefined;

            for ( let blockIndex = 0; blockIndex < 16; blockIndex++) {
                const A = Math.floor(blockIndex / 4) * blockHeight;
                const P = blockIndex % 4 * blockWidth;
                const s = Math.floor(blockIndex / 4);
                const C = (y = blockIndex % 4 * 4 + s) % 4 * blockWidth;
                const k = Math.floor(y / 4) * blockHeight;
                ctx.drawImage(bitmap, P, A, blockWidth, blockHeight, C, k, blockWidth, blockHeight );
            }

            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        } );
    }

}

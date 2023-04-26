import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

//very Similar to Yanmaga - its called ComiciViewer
export default class YoungChampion extends Connector {
    constructor() {
        super();
        super.id = 'youngchampion';
        super.label = 'YoungChampion';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://youngchampion.jp';
        this.defaultOrder = [];
        this.links = {
            login: 'https://youngchampion.jp/signin'
        };
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.defaultOrder.push([i, j]);
            }
        }
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri);
        const [data] = await this.fetchDOM(request, 'h1.series-h-title span:not([class])');
        const id = uri.pathname;
        const title = data.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id+'/list', this.url);
        const request = new Request(uri);
        const data = await this.fetchDOM(request, 'div.series-ep-list a');
        return data.map(chapter => {
            return {
                id : new URL(chapter.dataset['href']).pathname,
                title : chapter.querySelector('span.series-ep-list-item-h-text').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri);
        const [viewer] = await this.fetchDOM(request, '#comici-viewer');
        if (!viewer) {
            throw new Error(`The chapter '${chapter.title}' is neither public, nor purchased!`);
        }
        const coord = await this._fetchCoordInfo(viewer);
        return coord.result.map(image => {
            return this.createConnectorURI({
                url: image.imageUrl,
                scramble: image.scramble,
            });
        });
    }

    async _handleConnectorURI(payload) {
        const request = new Request(new URL(payload.url));
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        const res = await fetch(request);
        const blob = await res.blob();
        const image = await createImageBitmap(blob);
        const canvas = this._descramble(image, payload.scramble);
        const blobFinally = await this._canvasToBlob(canvas);
        return this._blobToBuffer(blobFinally);
    }

    async _fetchCoordInfo(viewer) {
        //first request get page count
        let uri = new URL('/book/contentsInfo', this.url);
        uri.searchParams.set('comici-viewer-id', viewer.getAttribute('comici-viewer-id'));
        uri.searchParams.set('user-id', viewer.dataset['memberJwt']);
        uri.searchParams.set('page-from', '0');
        uri.searchParams.set('page-to', '1');
        let request = new Request(uri);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        const data = await this.fetchJSON(request);

        //second request fetch actual pages data
        const numbers = data.totalPages;
        uri = new URL('/book/contentsInfo', this.url);
        uri.searchParams.set('comici-viewer-id', viewer.getAttribute('comici-viewer-id'));
        uri.searchParams.set('user-id', viewer.dataset['memberJwt']);
        uri.searchParams.set('page-from', '0');
        uri.searchParams.set('page-to', numbers);
        request = new Request(uri);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        return await this.fetchJSON(request);
    }

    _decodeScrambleArray(scramble) {
        const decoded = [];
        const encoded = scramble.replace(/\s+/g, '').slice(1).slice(0, -1).split(',');
        for (let i = 0; i < this.defaultOrder.length; i++) {
            decoded.push(this.defaultOrder[encoded[i]]);
        }
        return decoded;
    }

    _descramble(imageDom, scrambleString) {
        const width = imageDom.width;
        const height = imageDom.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        const decodedArray = this._decodeScrambleArray(scrambleString);
        const tileWidth = Math.floor(width / 4);
        const tileHeight = Math.floor(height / 4);
        for (let k = 0, i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const x = decodedArray[k][0], y = decodedArray[k][1];
                context.drawImage(imageDom, tileWidth * x, tileHeight * y, tileWidth, tileHeight, tileWidth * i, tileHeight * j, tileWidth, tileHeight);
                k++;
            }
        }
        return canvas;
    }

    _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }
}

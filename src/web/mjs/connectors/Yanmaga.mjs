import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Yanmaga extends Connector {
    constructor() {
        super();
        super.id = 'yanmaga';
        super.label = 'Yanmaga';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://yanmaga.jp';
        this.apiUrl = 'https://api2-yanmaga.comici.jp';
        this.defaultOrder = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.defaultOrder.push([i, j]);
            }
        }
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri);
        const [data] = await this.fetchDOM(request, '.detail-header-title');
        const id = uri.pathname;
        const title = data.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('comics', this.url));
        const data = await this.fetchDOM(request, '.ga-comics-book-item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.mod-book-title').textContent.trim(),
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri);
        const dom = await this.fetchDOM(request);
        const csrfToken = dom.querySelector('meta[name=csrf-token]').content;
        const episodeCount = dom.querySelector('#contents').dataset.count;
        const count = Math.ceil(episodeCount / 50);
        const chapters = [];
        for (let i = 0; i < count; i++) {
            const epUri = new URL(`${manga.id}/episodes`, this.url);
            epUri.searchParams.set('offset', String(i * 50));
            epUri.searchParams.set('cb', Date.now());
            const epRequest = new Request(epUri);
            epRequest.headers.set('x-csrf-token', csrfToken);
            const matches = await this.fetchRegex(epRequest, /'beforeend', "(.*)"/g);
            for (const value of matches) {
                if (!value.includes('<a class')) {
                    continue;
                }
                const content = value.replace(/\\'/g, '\'').replace(/\\"/g, '"').replace(/\\\//g, '/');
                const dom = this.createDOM(content);
                const anchorElement = dom.querySelector('a.mod-episode-link');
                chapters.push({
                    id: this.getRootRelativeOrAbsoluteLink(anchorElement, this.url),
                    title: dom.querySelector('.mod-episode-title').textContent.trim(),
                });
            }
        }
        return chapters;
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

    _fetchCoordInfo(viewer) {
        const uri = new URL('/book/coordinateInfo', this.apiUrl);
        uri.searchParams.set('comici-viewer-id', viewer.getAttribute('comici-viewer-id'));
        const request = new Request(uri);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        return this.fetchJSON(request);
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
import Connector from '../../engine/Connector.mjs';

//very Similar to Yanmaga - its called ComiciViewer
export default class Comici extends Connector {
    constructor() {
        super();
        this.defaultOrder = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.defaultOrder.push([i, j]);
            }
        }

        this.mangaListPath = '/series/list?page={page}';
        this.queryManga = 'div.series-box-vertical > a';
        this.queryMangaTitle = 'h2.title-text';
        this.apiPath = '/';
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL( this.mangaListPath.replace('{page}', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryManga);
        return data.map(element => {
            const titleElement = element.querySelector(this.queryMangaTitle);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: titleElement ? (titleElement.textContent || titleElement.text).trim() : element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL('/episodes/' + chapter.id, this.url);
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

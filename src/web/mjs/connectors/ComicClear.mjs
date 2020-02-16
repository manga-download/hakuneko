import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicClear extends Connector {

    constructor() {
        super();
        super.id = 'comicclear';
        super.label = 'コミッククリア (Comic Clear)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.comic-clear.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section div.content h2.title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL('/comics.aspx?l=999&n=0', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comic-box');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.box-link'), request.url),
                title: element.querySelector('div.title').textContent.replace(/[『』]/g, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div[class*="comic-wrap"] div.comic');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.box-link'), request.url),
                title: element.querySelector('div:not(.new-icon)').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.pathname += '/book.xml';
        if(uri.origin !== this.url) {
            alert('This chapter is hot-linked to a different provider!\nPlease check the following website/connector:\n\n' + uri.origin);
            return [];
        }
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'bookInformation total[type="Number"]');
        let pageCount = parseInt(data[0].textContent);
        let pageLinks = [];
        for(let page = 1; page <= pageCount; page++) {
            let puzzle = [1, 2, 3, 4, 5, 6].map(part => new URL(`./page${page}/x2/${part}.jpg`, uri).href);
            let pageLink = this.createConnectorURI({
                columns: 2,
                rows: 3,
                puzzle: puzzle
            });
            pageLinks.push(pageLink);
        }
        return pageLinks;
    }

    async _handleConnectorURI(payload) {
        let promises = payload.puzzle.map(async part => {
            let response = await fetch(new Request(part, this.requestOptions));
            let data = await response.blob();
            return createImageBitmap(data);
        });
        let bitmaps = await Promise.all(promises);
        let data = await this.composePuzzle(payload.columns, payload.rows, bitmaps);
        return this._blobToBuffer(data);
    }

    async composePuzzle(columns, rows, bitmaps) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas');
            canvas.width = columns * bitmaps[0].width;
            canvas.height = rows * bitmaps[0].height;
            var ctx = canvas.getContext('2d');

            for(let blockY = 0; blockY < rows; blockY++) {
                for(let blockX = 0; blockX < columns; blockX++) {
                    let bitmap = bitmaps[blockY * columns + blockX];
                    ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, blockX * bitmap.width, blockY * bitmap.height, bitmap.width, bitmap.height);
                }
            }

            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }
}
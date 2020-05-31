import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Sukima extends Connector {

    constructor() {
        super();
        super.id = 'sukima';
        super.label = 'Sukima';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.sukima.me';
        this.requestOptions.headers.set( 'x-referer', this.url );
        this.lock = false;
    }

    async _getMangas() {
        let categorys = await this._fetchPOST('/api/book/v1/free/','{"store":false,"genre":"0"}');

        let uri;
        let pages;
        let mangas = [];
        for (const category of categorys.rows) {
            if (category.more_btn.link.startsWith('/book/search/')) {
                uri = new URL(category.more_btn.link, this.url);
                pages = 1;
                for (let page = 1; page <= pages; page++) {
                    let body = JSON.stringify(
                        {
                            'free': [1, 2],
                            'page': page,
                            'sort_by': 0,
                            'tag': [uri.searchParams.get('tag')]
                        }
                    );

                    let pageContent = await this._fetchPOST('/api/v1/search/', body);
                    pages = pageContent.max_page;

                    for (const manga of pageContent.items) {
                        mangas.push(
                            {
                                id: manga.title_code,
                                title: manga.title_name
                            }
                        );
                    }
                }
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        let books = await this._fetchPOST('/api/book/v1/title/'+manga.id+'/','{}');

        let chapters = [];
        for (const book of books.contents) {
            for (const chapter of book.stories) {
                chapters.push(
                    {
                        id: '/bv/t/' + chapter.title_code + '/v/' + chapter.volume + '/s/' + chapter.story + '/p/1',
                        title: '(' + chapter.volume.toString().padStart(3, '0') + '-' + chapter.story.toString().padStart(3, '0') + ')' + chapter.info.text.trim().replace(manga.title, '')
                    }
                );
            }
        }
        return chapters;
    }

    async _getPages(chapter) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let shuffle_data = [];
                        for (let page = 0; page < PAGES_INFO.length; page++) {
                            shuffle_data.push(
                                {
                                    id: PAGES_INFO[page].page_url,
                                    blocklen: BLOCKLEN,
                                    shuffle_map: JSON.parse(PAGES_INFO[page].shuffle_map)
                                }
                            )
                        }
                        resolve(shuffle_data);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        let request = new Request(new URL(chapter.id, this.url));
        let data = await Engine.Request.fetchUI(request, script);

        return data.map(page => this.createConnectorURI(
            {
                id: page.id,
                blocklen: page.blocklen,
                shuffle_map: page.shuffle_map,
                referer: chapter.id
            }
        ));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(new URL(payload.id), this.requestOptions);
        request.headers.set('x-referer', this.getRootRelativeOrAbsoluteLink(payload.referer, this.url));
        let response = await fetch(request);
        let blob = await response.blob();
        let bitmap = await createImageBitmap(blob);

        let canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');

        let xSplitCount = Math.floor(bitmap.width / payload.blocklen);
        let ySplitCount = Math.floor(bitmap.height / payload.blocklen);
        let count = 0;
        ctx.drawImage(bitmap, 0, ySplitCount * payload.blocklen + 1, bitmap.width, bitmap.height - ySplitCount * payload.blocklen, 0, ySplitCount * payload.blocklen, bitmap.width, bitmap.height - ySplitCount * payload.blocklen);

        for (let col = 0; col < xSplitCount; col++) {
            for (let row = 0; row < ySplitCount; row++) {
                let dx = payload.shuffle_map[count][0];
                let dy = payload.shuffle_map[count][1];
                let sx = col * payload.blocklen;
                let sy = row * payload.blocklen;
                ctx.drawImage(bitmap, sx, sy, payload.blocklen, payload.blocklen, dx, dy, payload.blocklen, payload.blocklen);
                count++;
            }
        }

        let data = await this._canvasToBlob(canvas);
        return this._blobToBuffer(data);
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }

    async _getMangaFromURI(uri) {
        let id = uri.pathname.match(/\/(\w+)\/?$/)[1];
        let data = await this._fetchPOST('/api/book/v1/title/'+id+'/','{}');
        return new Manga(this, id, data.title);
    }

    async _fetchPOST(uri, body) {
        let request = new Request(new URL(uri, this.url), {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        return await this.fetchJSON(request);
    }
}
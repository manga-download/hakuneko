import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Sukima extends Connector {

    constructor() {
        super();
        super.id = 'sukima';
        super.label = 'Sukima';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.sukima.me';
        this.language = 'japanese';
        this.requestOptions.headers.set( 'x-referer', this.url );
        this.lock = false;
    }

    async _getMangas() {
        let request = new Request(new URL('/api/book/v1/free/', this.url), {
            method: 'POST',
            body: '{"store":false,"genre":"0"}',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        let categorys = await this.fetchJSON(request);

        let uri;
        let pages;
        let mangas = [];
        for (const category of categorys.rows) {
            if (category.more_btn.link.startsWith('/book/search/')) {
                uri = new URL(category.more_btn.link, this.url);
                pages = 1;
                for (let page = 1; page <= pages; page++) {
                    request = new Request(new URL('/api/v1/search/', this.url), {
                        method: 'POST',
                        body: '{"free":["1","2"],"page":'+page+',"sort_by":"0","tag":["'+uri.searchParams.get('tag')+'"]}',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                        }
                    });

                    let pageContent = await this.fetchJSON(request);
                    pages = pageContent.max_page;

                    for (const manga of pageContent.items) {
                        mangas.push(
                            {
                                id: '/api/book/v1/title/'+manga.title_code+'/',
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
        let request = new Request(new URL(manga.id, this.url), {
            method: 'POST',
            body: '{}',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        });

        let chapters = [];
        let books = await this.fetchJSON(request);
        for (const book of books.contents) {
            for (const chapter of book.stories) {
                chapters.push(
                    {
                        id: '/bv/t/' + chapter.title_code + '/v/' + chapter.volume + '/s/' + chapter.story + '/p/0',
                        title: chapter.volume.toString().padStart(3, '0') + '-' + chapter.story.toString().padStart(3, '0') + ' - ' + chapter.info.text.trim()
                    }
                );
            }
        }
        return chapters;
    }

    async _getPages(manga) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    let shuffle_data = [];
                    for (page = 0; page < PAGES_INFO.length; page++) {
                        shuffle_data.push(
                            {
                                id: PAGES_INFO[page].page_url,
                                blocklen: BLOCKLEN,
                                shuffle_map: JSON.parse(PAGES_INFO[page].shuffle_map)
                            }
                        )
                    }
                    resolve(shuffle_data);
                }, 2500);
            });
        `;
        let request = new Request(new URL(manga.id, this.url));
        let data = await Engine.Request.fetchUI(request, script);

        return data.map(page => {
            return this.createConnectorURI(
                {
                    id: page.id,
                    blocklen: page.blocklen,
                    shuffle_map: page.shuffle_map,
                }
            );
        });
    }

    async _handleConnectorURI(payload) {
        while (this.lock) {
            await this.throttle_download( Math.floor(Math.random() * (2000 - 1000)) + 1000);
        }
        this.lock = true;

        let request = new Request(new URL(payload.id), this.requestOptions);
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

        for (let i = 0; i < xSplitCount; i++) {
            for (let j = 0; j < ySplitCount; j++) {
                let _x = payload.shuffle_map[count][0];
                let _y = payload.shuffle_map[count][1];
                let w = payload.blocklen;
                let h = payload.blocklen;
                let x = i * payload.blocklen;
                let y = j * payload.blocklen;
                let _w = payload.blocklen;
                let _h = payload.blocklen;
                ctx.drawImage(bitmap, x, y, w, h, _x, _y, _w, _h);
                count += 1;
            }
        }

        let data = await this._canvasToBlob(canvas);

        this.lock = false;
        return this._blobToBuffer(data);
    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }

    throttle_download(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

    async _getMangaFromURI(uri) {
        let title_code = uri.href.split('/');
        while( title_code[title_code.length-1] == '') {
            title_code.pop();
        }
        title_code = title_code.slice(-1);
        let id = '/api/book/v1/title/'+title_code+'/';
        
        let request = new Request(new URL(id, this.url), {
            method: 'POST',
            body: '{}',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        });
        let data = await this.fetchJSON(request);
        return new Manga(this, this.getRootRelativeOrAbsoluteLink(id, this.url), data.title);
    }
}
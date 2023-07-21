import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReadManga extends Connector {

    constructor() {
        super();
        super.id = 'readmanga';
        super.label = 'ReadManga';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://readmanga.live';
        this.links = {
            login: 'https://grouple.co/internal/auth/login'
        };

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests.\nSlightly increase the value when getting 429 errors during manga list update.',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 1500
            }
        };

        this.preferSubtitleAsMangaTitle = true;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#mangaBox h1.names span.name');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/list', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'span.pagination a:nth-last-child(2)');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            await this.wait(this.config.throttle.value);
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/list?offset=' + page * 70, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tile div.desc');
        return data.map( element => {
            let a = element.querySelector('h3 a');
            let h4 = element.querySelector('h4');
            return {
                id: this.getRootRelativeOrAbsoluteLink(a, this.url),
                title:  this.preferSubtitleAsMangaTitle && h4 ? h4.title : a.title
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#mangaBox' );
        let content = data[0];
        let mangaTitle = content.querySelector('h1.names span.name').innerText.trim();
        let chapterList = [...content.querySelectorAll('div#chapters-list table tr td a')];
        return chapterList.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/\s{1,}/g, ' ').replace(mangaTitle, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(resolve => {
                const payload = {
                    pics: rm_h.pics.map(pic => rm_h.reader.preparePicUrl(pic.url)),
                    servers: rm_h.servers.map(server => server.path)
                };
                resolve(payload);
            });
        `;
        const uri = new URL(chapter.id + '?mtr=1', this.url);
        const request = new Request(uri, this.requestOptions);
        const payload = await Engine.Request.fetchUI(request, script);
        return payload.pics.map(element => {
            return this.createConnectorURI({
                picture: element,
                servers: payload.servers
            });
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.picture, this.requestOptions);
        let response = await fetch(request);
        if (response.status !== 200) {
            const uri = new URL(payload.picture);
            for (let server of payload.servers) {
                if (`${uri.origin}/` === server) {
                    continue;
                }
                request = new Request(new URL(uri.pathname, server), this.requestOptions);
                response = await fetch(request);
                if (response.status === 200) {
                    break;
                }
            }
        }
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}

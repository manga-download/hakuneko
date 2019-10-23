import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicoID extends Connector {

    constructor() {
        super();
        super.id = 'comicoid';
        super.label = 'ComicoID';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://www.comico.co.id';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapban div.con h2, div.package-cover_body h1.package-cover_title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    async _getMangaListFromPages(base, page) {
        page = page || 1;
        let request = new Request(this.url + base + page, this.requestOptions);
        let data = await this.fetchJSON(request); // data can be single object or array of objects
        let mangaList = [].concat(data.data).reduce((accumulator, item) => {
            let webcomics = (item['list'] || []).filter(entry => entry.id > 0).map(entry => {
                return{
                    // '/challenge/titles/' + entry.id
                    id: '/titles/' + entry.id,
                    title: entry.name
                };
            });
            let ecomics = Object.keys(item['titleMap'] || {}).map(key => {
                let entry = item.titleMap[key];
                return{
                    id: '/titles/' + entry.id,
                    title: entry.name
                };
            });
            return accumulator.concat(webcomics, ecomics);
        }, []);
        if(page !== '#' && mangaList.length > 0) {
            let mangas = await this._getMangaListFromPages(base, page + 1);
            return mangaList.concat(mangas);
        } else {
            return mangaList;
        }
    }

    /**
     *
     */
    async _getMangaList(callback) {
        try {
            let mangaList = [].concat(
                await this._getMangaListFromPages('/book/genre/list', '#'),
                await this._getMangaListFromPages('/weekly/list?page='),
                await this._getMangaListFromPages('/titles/completed?page=')
                /*
                 * TODO: Add support for challenges?
                 * http://www.comico.co.id/challenge/season/1
                 * http://www.comico.co.id/challenge/season/2
                 */
            );
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    async _getChapterListFromPages(base, page) {
        page = page || 1;
        let request = new Request(this.url + base + '?page=' + page, this.requestOptions);
        let data = await this.fetchJSON(request);
        let chapterList = (data['data'] || { list: [] }).list.map(entry => {
            return{
                id: base + entry.id,
                title: entry.name,
                language: ''
            };
        });
        if(base.startsWith('/title') && chapterList.length > 0) {
            let chapters = await this._getChapterListFromPages(base, page + 1);
            return chapterList.concat(chapters);
        } else {
            return chapterList;
        }
    }

    /**
     *
     */
    async _getChapterList(manga, callback) {
        try {
            let chapterList = await this._getChapterListFromPages(manga.id + '/chapters/');
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    async _getPageList(manga, chapter, callback) {
        try {
            let script = `
                new Promise(resolve => {
                    let images = document.querySelectorAll('div.viewtoon div._view img._image');
                    if(images.length) {
                        return resolve([...images].map(image => image.src));
                    }
                    if(comico.Config.keyList) {
                        return resolve(JSON.parse(comico.CommonUtil.hexDecode(comico.Config.keyList)).list.map(image => image.url));
                    }
                    resolve([ 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwIiB3aWR0aD0iMjAwIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZHk9IjAuMjVlbSIgZmlsbD0icmVkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DaGFwdGVyIGlzIExvY2tlZCE8L3RleHQ+PC9zdmc+' ]);
                });
            `;
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let pageList = await Engine.Request.fetchUI(request, script);
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}
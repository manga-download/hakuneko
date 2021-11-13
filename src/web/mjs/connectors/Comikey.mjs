import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComiKey extends Connector {

    constructor() {
        super();
        super.id = 'comikey';
        super.label = 'Comikey';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://comikey.com';
        this.chapterUrl = 'https://relay-us.epub.rocks/consumer/COMIKEY/series/';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request);
        return new Manga(this, uri.pathname, data.querySelector('span.title').innerText);
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
        let uri = new URL('/comics/', this.url);
        uri.searchParams.set('order', 'name');
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request);

        let mangaList = [...data.querySelectorAll('.series-listing.full-row[data-view="list"] > ul > li > div.series-data > span.title > a')];
        return mangaList.map(manga => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(manga, this.url),
                title: manga.innerText
            };
        });
    }

    async _getChapters(manga) {
        let webUri = new URL(manga.id, this.url);
        const webRequest = new Request(webUri, this.requestOptions);
        const webData = await this.fetchDOM(webRequest);
        const e4pid = JSON.parse(webData.querySelector('script#comic').innerText).e4pid;
        let apiUri = new URL(e4pid + '/content?clientid=dylMNK5a32of', this.chapterUrl);
        const apiRequest = new Request(apiUri, this.requestOptions);
        const apiData = await this.fetchJSON(apiRequest);
        let idTemplate = manga.id.split('/');
        let idTemp = idTemplate.slice(0, idTemplate.length - 2).join('/') + '/';
        let idTempFinal = idTemp.replace('comics', 'read');
        return apiData.data.episodes.map(chapter => {
            let chapterName = '';
            chapter.name.length > 0 ? chapterName = chapter.name[0].name : '';
            chapterName ? chapterName = " - " + chapterName : '';
            return {
                id: idTempFinal + chapter.id.split('-')[1] + '/chapter-' + chapter.number.toString().replace('.', '-'),
                title: 'Chapter ' + chapter.number.toString() + chapterName,
                language: chapter.language
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async (resolve, reject) => {
                function getImage(page, base) {
                    const uri = new URL(base);
                    const image = page.alternate.sort((a, b) => a.height - b.height).pop().href;
                    uri.pathname = [...uri.pathname.split('/').slice(0, -1), image].join('/');
                    return uri.href;
                }
                try {
                    let init = document.querySelector('script#reader-init');
                    if(!init) {
                        throw new Error('There was no content found for "${chapter.title}", make sure it is accessible (login, purchase, ...)!');
                    }
                    init = JSON.parse(init.text);
                    const response = await fetch(init.manifest);
                    if(response.headers.get('content-type').startsWith('application/json')) {
                        // CASE 1: Manifest is not DRM protected
                        const manifest = await response.json();
                        const images = manifest.readingOrder.map(page => getImage(page, response.url));
                        resolve(images);
                    } else {
                        // CASE 2: Manifest is DRM protected
                        document.addEventListener('e4p_web_readyDRM', async event => {
                            try {
                                const manifest = JSON.parse(await event.detail);
                                const images = manifest.readingOrder.map(page => getImage(page, response.url));
                                resolve(images);
                            } catch(error) {
                                reject(error);
                            }
                        });
                        document.dispatchEvent(new CustomEvent('e4p_web_initDRM', { detail: { data: await response.arrayBuffer(), seed: init.seed } }));
                    }
                } catch(error) {
                    reject(error);
                }
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script, 10000);
    }
}
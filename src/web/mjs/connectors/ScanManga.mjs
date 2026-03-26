import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import HeaderGenerator from '../engine/HeaderGenerator.mjs';

export default class ScanManga extends Connector {

    constructor() {
        super();
        super.id = 'scanmanga';
        super.label = 'ScanManga';
        this.tags = ['manga', 'french', 'novel'];
        this.url = 'https://www.scan-manga.com';
        this.requestOptions.headers.set('accept-language', HeaderGenerator.randomLang());
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/scanlation/scan.data.json', this.url), this.requestOptions);
        request.headers.set('x-cookie', `_ga=GA1.2.137581646.${parseInt(Date.now()/1000)}; addtl_consent=1~${new Array(647).fill().map(() => Math.floor(41 * Math.random())).join('.')}`);
        request.headers.set('x-referer', this.url + '/scanlation/liste_series.html');
        request.headers.set('x-requested-with', 'XMLHttpRequest');
        let data = await this.fetchJSON(request);
        let mangaList = [];
        for(let title in data) {
            let id = data[title][0];
            let slug = data[title][1] || title;
            let element = document.createElement('div');
            element.innerHTML = title;
            mangaList.push({
                id: `/${id}/${slug}.html`,
                title: element.textContent.trim()
            });
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.texte_volume_manga ul li.chapitre div.chapitre_nom');
        return data
            .filter(element => element.querySelector('a:first-of-type[href]'))
            .map(element => {
                let anchor = element.querySelector('a:first-of-type');
                return {
                    id: this.getRootRelativeOrAbsoluteLink(anchor, this.url),
                    title: element.textContent.trim(),
                    language: ''
                };
            });
    }

    async _getPagesManga(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        let baseURL = data.match(/['"](https?:\/\/lel\.scan-manga\.com:\d+\/.*?\/\d+\/\d+\/.*?)['"]/)[1];
        let regex = /['"](.*?zoneID.*?pageID.*?siteID.*?)['"]/g;
        let pageList = [];
        let match = undefined;
        // eslint-disable-next-line no-cond-assign
        while (match = regex.exec(data)) {
            pageList.push(match[1]);
        }
        return pageList.map(link => this.createConnectorURI({
            url: baseURL + link,
            referer: request.url
        }));
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.aLN');
        return data.length > 0 ? this._getPagesNovel(request) : this._getPagesManga(chapter);
    }

    async _getPagesNovel(request) {
        let darkmode = Engine.Settings.NovelColorProfile();
        let script = `
            new Promise((resolve, reject) => {
                document.body.style.width = '56em';
                let novel = document.querySelector('article.aLN');
                novel.style.padding = '1.5em';
                [...novel.querySelectorAll(":not(:empty)")].forEach(ele => {
                    ele.style.backgroundColor = '${darkmode.background}'
                    ele.style.color = '${darkmode.text}'
                })
                novel.style.backgroundColor = '${darkmode.background}'
                novel.style.color = '${darkmode.text}'
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try{
                        let canvas = await html2canvas(novel);
                        resolve(canvas.toDataURL('image/png'));
                    }catch (error){
                        reject(error)
                    }
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;
        return [await Engine.Request.fetchUI(request, script, 30000, true)];
    }

    _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', payload.referer);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}

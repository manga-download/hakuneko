import Connector from '../engine/Connector.mjs';

export default class Novelgo extends Connector {

    constructor() {
        super();
        super.id = 'novelgo';
        super.label = 'Novelgo.ID';
        this.tags = [ 'novel', 'indonesian' ];
        this.url = 'https://novelgo.id';
        this.path = '/genre/page/';

        this.queryMangas = 'div.novel-item-content h3.novel-item-title a';
        this.novelContentQuery = 'div.noveils-chapter-wrapper div#chapter-post-content';
        this.novelObstaclesQuery = 'div.code-block';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em'; // parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getMangasFromPage(page) {
        const URI = new URL(this.path + page + '/', this.url);
        let request = new Request(URI, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getChaptersFromJSON(page, id){
        const URI = new URL('/wp-json/noveils/v1/chapters?paged=' + page + '&perpage=250&category=' + id, this.url);
        let request = new Request(URI, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.permalink, request.url),
                title: element.post_title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const MANGA_ID = manga.id.substring(7).slice(0, -1);
        let chapterList = [];
        for (let page = 1, run = true; run; page++){
            let chapters = await this._getChaptersFromJSON(page, MANGA_ID);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getPagesNovel(request) {
        let script = `
            new Promise(resolve => {
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('div.noveils-chapter-page div.container');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
                let novel = document.querySelector('div#chapter-post-content');
                novel.style.padding = '${this.novelPadding}';
                document.querySelectorAll('${this.novelObstaclesQuery}').forEach(element => element.style.display = 'none');
                let script = document.createElement('script');
                script.onload = async function() {
                    let canvas = await html2canvas(novel);
                    resolve(canvas.toDataURL('${this.novelFormat}'));
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;
        return [ await Engine.Request.fetchUI(request, script) ];
    }

    async _getPages(chapter) {
        const URI = new URL(chapter.id, this.url);
        let request = new Request(URI, this.requestOptions);
        let data = await this.fetchDOM(request, this.novelContentQuery);
        return data.length > 0 ? this._getPagesNovel(request) : super._getPages(chapter);
    }
}

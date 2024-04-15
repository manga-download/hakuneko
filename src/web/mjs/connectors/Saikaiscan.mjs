import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SaikaiScan extends Connector {

    constructor() {
        super();
        super.id = 'saikaiscan';
        super.label = 'Saikaiscan';
        this.tags = [ 'manga', 'portuguese', 'webtoon', 'novel' ];
        this.url = 'https://saikaiscans.net';
        this.api = 'https://api.saikaiscans.net/api/stories';
        this.imagesurl = 'https://s3-alpha.saikaiscans.net';
        this.novelContentQuery = 'div#leitor-serie-body';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em';
        this.novelPadding = '1.5em';
        this.links = {
            login: 'https://saikaiscan.net/login'
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.__title h1');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.api+'?page='+page, this.url), this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.map(element => {
            return {
                id: '/'+element.format.slug+'/'+element.slug,
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id+'?tab=capitulos', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.__chapters li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.__chapters--number').textContent.trim(),
            };
        }).reverse();
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        if (chapter.id.match(/\/series\//)) {
            return this._getPagesNovel(request);
        } else {
            let script = `
            new Promise(resolve => {
                let pages = __NUXT__;
                resolve(pages);
            });
            `;
            let pageList = await Engine.Request.fetchUI(request, script);
            pageList = pageList.data[0].release.data;
            return pageList.release_images.map( element => {
                return new URL(element.image, this.imagesurl).href;
            });
        }
    }

    async _getPagesNovel(request) {
        let darkmode = Engine.Settings.NovelColorProfile();
        let script = `
           new Promise((resolve, reject) => {
               
                document.body.style.width = '${this.novelWidth}';
                let novel = document.querySelector('${this.novelContentQuery}');
                novel.style.maxWidth = '${this.novelWidth}';
                novel.style.margin = '0';
                novel.style.padding = '${this.novelPadding}';
                novel.style.backgroundColor = '${darkmode.background}'
                novel.style.color = '${darkmode.text}'
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try{
                        let canvas = await html2canvas(novel);
                        resolve(canvas.toDataURL('${this.novelFormat}'));
                    }catch (error){
                        reject(error)
                    }
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;
        return [ await Engine.Request.fetchUI(request, script, 30000, true) ];
    }
}

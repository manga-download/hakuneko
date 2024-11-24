import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReadNovelFull extends Connector {

    constructor() {
        super();
        super.id = 'readnovelfull';
        super.label = 'ReadNovelFull';
        this.tags = [ 'novel', 'english' ];
        this.url = 'https://readnovelfull.com';
        this.path = '/novel-list/latest-release-novel';
        this.queryMangas = 'h3.novel-title a';
        
        this.novelContentQuery = 'div#chr-content';
        //this.novelObstaclesQuery = 'div.code-block';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em'; // parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';        
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'li.last a');
        const pageCount = parseInt(data[0].getAttribute('data-page'))+1;
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
         }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(this.path+'?page=' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
    async _getChapters(manga) {
        let  uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#rating');
        const mangaid = data[0].getAttribute('data-novel-id');

        let apiuri = new URL('/ajax/chapter-archive?novelId='+mangaid, this.url);
        request = new Request(apiuri, this.requestOptions);
        request.headers.set('x-referer', uri);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        data = await this.fetchDOM(request, 'a');
        
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        }).reverse();
    }
    
   async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return this._getPagesNovel(request);

    }
    async _getPagesNovel(request) {
        let darkmode = Engine.Settings.NovelColorProfile();
        let script = `
           new Promise(resolve => {
                document.body.style.width = '${this.novelWidth}';
                let novel1 = document.querySelector('${this.novelContentQuery}');
                novel1.style.padding = '${this.novelPadding}';
                [...novel1.querySelectorAll(":not(:empty)")].forEach(ele => {
                    ele.style.backgroundColor = '${darkmode.background}'
                    ele.style.color = '${darkmode.text}'
                })
                novel1.style.backgroundColor = '${darkmode.background}'
                novel1.style.color = '${darkmode.text}'
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try{
                        let canvas = await html2canvas(novel1);
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
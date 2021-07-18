import WordPressMangastream from './templates/WordPressMangastream.mjs';
//template/theme LightNovel, basically WordPressMangastreamNovel
export default class KolNovel extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kolnovel';
        super.label = 'Kol Novel (ملوك الروايات)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://kolnovel.com';

        this.queryChapters = 'div.eplister ul li a';
        this.queryChaptersTitle = 'div:not(.epl-date)';
        this.path = '/series/list-mode/';

        this.novelContentQuery = 'div.epwrapper div[itemprop="text"]';
        this.novelObstaclesQuery = 'div[class]';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em'; // parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.adLinkDecrypt(element);
            const title = this.queryChaptersTitle ? [...element.querySelectorAll(this.queryChaptersTitle)].map(ele => ele.textContent).join(' ') : element.text;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.novelContentQuery);
        return data.length > 0 ? this._getPagesNovel(request) : super._getPages(chapter);
    }

    async _getPagesNovel(request) {
        let darkmode = Engine.Settings.NovelColorProfile();
        let script = `
            new Promise((resolve, reject) => {
                document.body.className = document.body.className.replace('darkmode', 'lightmode')
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('div.bixbox div.epwrapper');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
                let novel = document.querySelector('div.epcontent');
                novel.style.padding = '${this.novelPadding}';
                [...novel.querySelectorAll(":not(:empty)")].forEach(ele => {
                    ele.style.backgroundColor = '${darkmode.background}'
                    ele.style.color = '${darkmode.text}'
                })
                novel.style.backgroundColor = '${darkmode.background}'
                novel.style.color = '${darkmode.text}'
                novel.querySelectorAll('${this.novelObstaclesQuery}').forEach(element => element.style.display = 'none');
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
import WordPressMangastream from './templates/WordPressMangastream.mjs';
//template/theme LightNovel, basically WordPressMangastreamNovel
export default class SakuraNovel extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sakuranovel';
        super.label = 'SakuraNovel';
        this.tags = ['novel', 'indonesian'];
        this.url = 'https://sakuranovel.id';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.novellist-blc ul li a.series';
        this.queryChapters = 'ul.series-chapterlists li a';
        this.queryChaptersTitle = 'span:not(.date)';
        this.path = '/daftar-novel/';

        this.novelContentQuery = 'div.asdasd';
        this.novelObstaclesQuery = '[data-index]';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em'; // parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getChapters(novel) {
        const novels = await super._getChapters(novel);
        novels.forEach(novel => novel.title = novel.title.replace(/Bahasa Indonesia$/i, '').trim());
        return novels;
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        return this._getPagesNovel(request);
    }

    async _getPagesNovel(request) {
        let darkmode = Engine.Settings.NovelColorProfile();
        let script = `
            new Promise((resolve, reject) => {
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('${this.novelContentQuery}');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
                let novel = document.querySelector('${this.novelContentQuery}');
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
        return [await Engine.Request.fetchUI(request, script, 30000, true)];
    }
}

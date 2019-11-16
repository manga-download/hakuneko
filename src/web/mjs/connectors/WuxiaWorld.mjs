import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WuxiaWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'wuxiaworld';
        super.label = 'WuxiaWorld';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://wuxiaworld.site';

        //this.formManga.append('vars[wp-manga-tag]', 'webcomics');
        this.novelFormat = 'image/png';
        this.novelWidth = '56em'; // parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.reading-content div[class^="text-"');
        return data.length > 0 ? this._getPagesNovel(request) : super._getPages(chapter);
    }

    async _getPagesNovel(request) {
        let script = `
            new Promise(resolve => {
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('div.content-area > div.container');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
                let novel = document.querySelector('div.entry-content');
                novel.style.padding = '${this.novelPadding}';
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
}
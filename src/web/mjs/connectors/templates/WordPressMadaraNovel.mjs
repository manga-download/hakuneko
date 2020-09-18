import WordPressMadara from './WordPressMadara.mjs';

export default class WordPressMadaraNovel extends WordPressMadara {

    constructor() {
        super();

        this.novelContentQuery = 'div.reading-content div[class^="text-"';
        this.novelObstaclesQuery = '_';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em'; // parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.novelContentQuery);
        return data.length > 0 ? this._getPagesNovel(request) : super._getPages(chapter);
    }

    async _getPagesNovel(request) {
        let script = `
            new Promise(resolve => {
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('div.content-area div.container');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
                let novel = document.querySelector('div.entry-content');
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
}
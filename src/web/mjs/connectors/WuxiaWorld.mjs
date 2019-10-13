import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WuxiaWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'wuxiaworld';
        super.label = 'WuxiaWorld';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://wuxiaworld.site';

        //this.formManga.append('vars[wp-manga-tag]', 'webcomics');
        this.novelFormat = 'image/png';
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let uri = new URL(chapter.id, this.url);
            uri.searchParams.set('style', 'list');
            let request = new Request(uri.href, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.reading-content div[class^="text-"');
            if(data.length > 0) {
                let pageLinks = await this._getPageListNovel(request);
                callback(null, pageLinks);
            } else {
                super._getPageList(manga, chapter, callback);
            }
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }

    async _getPageListNovel(request) {
        let script = `
            new Promise(resolve => {
                let novel = document.querySelector('div.entry-content');
                novel.style.padding = '1.5em';
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
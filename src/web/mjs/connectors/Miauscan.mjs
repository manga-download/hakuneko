import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MiauScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'miauscan';
        super.label = 'MiauScan';
        this.tags = [ 'manga', 'spanish', 'portuguese', 'scanlation' ];
        this.url = 'https://miaucomics.org';
        this.path = '/manga/list-mode/';

        this.novelContainer = 'div.entry-content';
        this.novelContent = 'div#readerarea.rdminimal';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em';// parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#readerarea.rdminimal');
        //reader for novel have this class. When its a manga there is no class at all so we call super.
        if (data.length == 0) {
            return await super._getPages(chapter).filter(image => !/dis2\.jpg/.test(image));
        }
        const darkmode = Engine.Settings.NovelColorProfile();
        const script = `
            new Promise((resolve, reject) => {
                document.body.style.width = '${this.novelWidth}';
                document.body.style.backgroundColor = '${darkmode.background}';
                let container = document.querySelector('${this.novelContainer}');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
                container.style.backgroundColor = '${darkmode.background}';
            
                let novel = document.querySelector('${this.novelContent}');
                novel.style.padding = '${this.novelPadding}';
                [...novel.querySelectorAll(":not(:empty)")].forEach(ele => {
                    ele.style.backgroundColor = '${darkmode.background}'
                    ele.style.color = '${darkmode.text}'
                })
            
                novel.style.backgroundColor = '${darkmode.background}'
                novel.style.color = '${darkmode.text}';
            
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try {
                        let canvas = await html2canvas(novel);
                        resolve(canvas.toDataURL('${this.novelFormat}'));
                    }
                    catch (error){
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

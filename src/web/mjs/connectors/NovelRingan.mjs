import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NovelRingan extends Connector {
    constructor() {
        super();
        super.id = 'novelringan';
        super.label = 'Novel Ringan';
        this.tags = ['novel', 'indonesian'];
        this.url = 'https://novelringan.com';

        this.novelContainerQuery = 'main.content';
        this.novelContentQuery = 'div.entry-content';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em';
        this.novelPadding = '1.5em';
    }

    async _getMangas() {
        let request = new Request(this.url + '/daftar-novel', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.blix ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.bxcl ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: '',
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let darkmode = Engine.Settings.NovelColorProfile();
        let script = `
            new Promise(resolve => {
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('${this.novelContainerQuery}');
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
                let script = document.createElement('script');
                script.onload = async function() {
                    let canvas = await html2canvas(novel);
                    resolve(canvas.toDataURL('${this.novelFormat}'));
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;

        return [await Engine.Request.fetchUI(request, script, 30000, true)];
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.entry-title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();

        return new Manga(this, id, title);
    }
}

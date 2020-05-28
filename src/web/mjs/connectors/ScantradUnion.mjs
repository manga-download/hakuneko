import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ScantradUnion extends Connector {

    constructor() {
        super();
        super.id = 'scantradunion';
        super.label = 'Scantrad Union';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://scantrad-union.com';
        this.language = 'fr';
    }

    async _getMangas() {
        let request = new Request(this.url + '/manga/', this.requestOptions);
        let pages = await this.fetchDOM(request, 'main div.pagination li:nth-last-child(2) > a');
        pages = Number(pages[0].pathname.match(/[\w\W]+\/(\d+)\/$/)[1]);

        let data;
        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(this.url + '/manga/page/' + page + '/');
            data = await this.fetchDOM(request, 'main article div.entry-post > h2 > a');
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element.href, this.url),
                    title: element.text.trim().replace(/^(\[Partenaire\])/,"")
                };
            }));
        }

        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-list div.accordionItem div.name-chapter');
        return data.map(element => {
            let number = element.querySelector('span.chapter-number').innerText.trim();
            let title = element.querySelector('span.chapter-name').innerText.trim();
            title = title.length ? ' - ' + title : title;
            element = element.querySelector('div.buttons a.btnlel:not([onclick])');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: number + title,
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                let result = [];
                if(window.obj) {
                    result = obj.images.map(page => [obj.site_url, obj.all_manga_dir, obj.title + '_' + page.manga_id, 'ch_' + page.chapter_number, page.image_name].join('/'));
                } else {
                    result = [...document.querySelectorAll('div.current-image img.manga-image')].map(img => img.src);
                }
                resolve(result);
            });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(new URL(uri.href), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.projet-description > h2');
        return new Manga(this, uri.pathname, data[0].textContent.trim().replace(/^(\[Partenaire\])/,""));
    }
}
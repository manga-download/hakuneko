import Connector from '../engine/Connector.mjs';

export default class ScantradUnion extends Connector {

    constructor() {
        super();
        super.id = 'scantradunion';
        super.label = 'Scantrad Union';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://scantrad-union.com';
    }

    async _getMangas() {
        let request = new Request(this.url + '/projets', this.requestOptions);
        let data = await this.fetchDOM(request, 'section.page-single div.accordionItem div.accordionItemContent > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('h2.index-top3-title').innerText.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-list div.accordionItem div.name-chapter');
        return data.map(element => {
            let number = element.querySelector('span.chapter-number').innerText.trim();
            let title = element.querySelector('span.chapter-name').innerText.trim();
            element = element.querySelector('div.buttons a.btnlel:not([onclick])');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: number + ' - ' + title,
                language: ''
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
        return data.map(link => this.createConnectorURI({
            url: encodeURI(link),
            referer: request.url
        }));
    }

    _handleConnectorURI( payload ) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', payload.referer);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}
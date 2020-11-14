import Connector from '../engine/Connector.mjs';

export default class RawMangatop extends Connector {

    constructor() {
        super();
        super.id = 'rawmangatop';
        super.label = 'Raw Manga (生漫画)';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://rawmanga.top';

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 1000
            }
        };
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/directory', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content ul.pagination li:nth-last-of-type(2) a.page-link', 3);
        let pageCount = parseInt(data[0].textContent);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/directory?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content ul.directory li.series div.details p.title a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tab-pane ul.list-group li.list-group-item a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = (await this.fetchDOM(request, 'select.custom-select option:last-of-type', 3))[1];
        return new Array(Number(data.value)).fill().map((_, page) => `${this.url}/viewer${chapter.id}/${page + 1}`);
    }

}
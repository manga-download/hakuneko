import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Tapas extends Connector {

    constructor() {
        super();
        super.id = 'tapas';
        super.label = 'Tapas';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://tapas.io';
        this.requestOptions.headers.set('x-cookie', 'adjustedBirthDate=1990-01-01');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/comics', this.url);
        uri.searchParams.set('b', 'ALL');
        uri.searchParams.set('g', 0);
        uri.searchParams.set('pageNumber', page);
        //uri.searchParams.set('pageSize', 20);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.section__body ul.content__list li.list__item a.thumb');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.querySelector('source').attributes.getNamedItem('alt').value.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];

        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[name="twitter:app:url:iphone"]');
        const series_id = data[0].content.match(/\/series\/\d+/)[0];

        let has_next = true;
        const time = Date.now();
        let page = 1;
        while (has_next) {
            request = new Request(new URL(series_id+'/episodes?page='+page+'&sort=OLDEST&init_load=0&since='+time+'&large=true&last_access=0&', this.url), this.requestOptions);
            request.headers.set('x-referer', this.getRootRelativeOrAbsoluteLink(manga.id, this.url));
            let response = await this.fetchJSON(request, this.requestOptions);
            has_next = response.data.pagination.has_next;
            chapterList.push(...await this._getChaptersFromHtml(response.data.body));
            page++;
        }

        return chapterList;
    }

    async _getChaptersFromHtml(payload) {
        let data = [...this.createDOM(payload).querySelectorAll('li.episode-list__item  > a')];

        return data
            .filter(element => !element.querySelector('i.sp-ico-episode-lock, i.sp-ico-schedule-white'))
            .map(element => {
                let scene = element.querySelector('div.info p.scene').textContent.trim();
                let title = element.querySelector('p.title span.title__body').textContent.trim();
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: scene + ' - ' + title,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.viewer > article > source.content__img');
        return data.map(image => this.getAbsolutePath(image.dataset.src, request.url));
    }
}
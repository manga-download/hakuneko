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
        uri.searchParams.set('pageNumber', page);
        //uri.searchParams.set('pageSize', 20);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.section__body ul.content__list li.list__item a.item__title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.paging a.paging__button--num');
        let pageCount = data.length === 0 ? 1 : parseInt(data.pop().href.match(/pageNumber=(\d+)/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let request = new Request(new URL(`${manga.id}?pageNumber=${page}`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'li.content__item  > a');
        return data
            .filter(element => !element.querySelector('i.sp-ico-episode-lock, i.sp-ico-schedule-white'))
            .map(element => {
                let scene = element.querySelector('div.item__info span.info__scene').textContent.trim();
                let title = element.querySelector('div.item__info div.info__title').textContent.trim();
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: scene + ' - ' + title,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.viewer__main source.content__img');
        return data.map(image => this.getAbsolutePath(image.dataset.src, request.url));
    }
}
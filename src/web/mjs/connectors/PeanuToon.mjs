import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class PeanuToon extends Connector {

    constructor() {
        super();
        super.id = 'peanutoon';
        super.label = 'Peanutoon (피너툰)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://www.peanutoon.com';
        this.links = {
            login : 'https://www.peanutoon.com/ko/login'
        };
    }

    async _getMangas() {
        const genres = ['BL', 'GL', '로맨스', '드라마', '코믹', '성인', '소설'];
        const days = ['월', '화', '수', '목', '금', '토', '일', '열흘', '기타'];
        const mangalist = [];
        mangalist.push(... await this._getmangaFromPage(genres, 'genre'));
        mangalist.push(... await this._getmangaFromPage(days, 'days'));
        return mangalist;

    }

    async _getmangaFromPage (tabs, category) {
        const mangalist = [];
        for (const menuName of tabs) {
            const url = new URL(`/api/comic/tab?which=${category}&locale=ko&menuName=${menuName}&start=&count=`, this.url);
            const request = new Request (url, this.requestOptions);
            request.headers.set('X-Requested-With', 'XMLHttpRequest');
            const data = await this.fetchJSON(request);
            const mangas = data.response.result.map(manga => {
                return {
                    id : `/ko/comic/detail/${manga.idx}/`,
                    title: `${manga.title}`,
                };
            });
            mangalist.push(...mangas);
        }

        return mangalist;
    }

    async _getChapters(manga) {
        const request = new Request(this.url + manga.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.detail_area a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title:  element.querySelectorAll('div.detail_work_list div div:not([class])')[0].textContent.trim() + " " + element.querySelectorAll('div.detail_work_list div div:not([class])')[1].textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        if(chapter.id.includes("/#payment"))
            throw new Error(`The paid chapter '${chapter.title}' has not been purchased!`);
        else if(chapter.id.includes("/login"))
            throw new Error(`The chapter '${chapter.title}' requires login!`);

        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section#viewer-list source.lazyload');
        return data.map(element => this.getAbsolutePath(element.dataset['src'], request.url));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.info_title h2');
        const id = uri.pathname;
        const title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }
}
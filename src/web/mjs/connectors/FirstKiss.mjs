import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class FirstKiss extends Connector {

    constructor() {
        super();
        super.id = 'firstkiss';
        super.label = 'LikeManga.io';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://likemanga.io';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-origin', this.url);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h1#title-detail-manga');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a');
        const pageCount = parseInt(data[0].search.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`?act=home&pageNum=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.card-body p.card-text a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const mangaid = manga.id.match(/-(\d+)\/$/)[1];
        const uri = new URL( `?act=ajax&code=load_list_chapter&manga_id=${mangaid}&page_num=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const response = await this.fetchJSON(request);
        let data = this.createDOM(response.list_chap);
        data = [...data.querySelectorAll( 'li.wp-manga-chapter a' )];
        return data.map(element => {
            return {
                id: new URL(element.href, request.url).pathname,
                title: element.text.trim(),
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);

        const script = `
            new Promise(resolve => {
                const tokenElement = document.querySelector("div.reading input#next_img_token");
                if (tokenElement != null) {
                    const imgCdnUrl = document.querySelector("div.reading #currentlink").getAttribute("value");
                    const imgdata = JSON.parse(atob(parseJwt(tokenElement.getAttribute('value')).data)); 
                    resolve(imgdata.map(image => new URL(image, imgCdnUrl).href));
                }
                const images = [...document.querySelectorAll("div.reading-detail.box_doc img")].filter(element => element.dataset.index);
                resolve(images.map(image => image.getAttribute('src')));
            });
        `;
        return (await Engine.Request.fetchUI(request, script)).map(image => this.createConnectorURI(image));
    }
}

import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class YawarakaSpirits extends Connector {

    constructor() {
        super();
        super.id = 'yawarakaspirits';
        super.label = 'やわらかスピリッツ (Yawaraka Spirits)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://yawaspi.com';

        this.path = [ '/series', '/completion' ];
        this.queryManga = 'article.work section.work__inner ul li a';
        this.queryOldManga = 'article.oldwork section.oldwork__inner ul li a';
        this.queryMangaTitle = 'dl dt strong';

        this.queryChapters = 'section.page__read div.page__read__inner ul.inner__content li a';
        this.queryChapterTitles = 'dl dt';

        this.queryPages = 'div.page__detail__inner div.page__detail__vertical div.vertical__inner ul li source';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split('|')[0].trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/series', this.requestOptions); //ongoing series
        let data = await this.fetchDOM(request, this.queryManga);
        request = new Request(this.url + "/completion"); //completed series
        data = data.concat(await this.fetchDOM(request, this.queryOldManga));
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector(this.queryMangaTitle).textContent
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector(this.queryChapterTitles).textContent
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
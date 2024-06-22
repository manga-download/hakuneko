import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicRyu extends Connector {

    constructor() {
        super();
        super.id = 'comicryu';
        super.label = 'COMICリュウ';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.comic-ryu.jp';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'article.sakuhin-article h1.sakuhin-article-title');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const categories = ['シリーズ一覧-連載中', '完結作品'];
        const mangasList = [];
        for (const category of categories) {
            const data = await this.fetchDOM(new Request(new URL(category, this.url), this.requestOptions), 'ul.m-series-list li a.m-list-sakuhin-list-item-link');
            const mangas = data.map(element => {
                return {
                    id: element.pathname,
                    title: element.querySelector('h1.sakuhin-article-title').textContent.trim(),
                };
            });

            mangasList.push(...mangas);
        }
        return mangasList;
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'a.sakuhin-episode-link');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'figure.wp-block-image source');
        return data.map(element => element.src );
    }
}

import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReManga extends Connector {

    constructor() {
        super();
        super.id = 'remanga';
        super.label = 'ReManga';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://remanga.org';
        this.api = 'https://api.remanga.org';
        this.requestOptions.headers.set('x-referer', this.url);

    }

    async _getMangaFromURI(uri) {
        uri.searchParams.delete('subpath');
        const slug = uri.pathname.split('/').pop();

        const request = new Request(new URL('/api/titles/' + slug, this.api), this.requestOptions);
        const { content } = await this.fetchJSON(request, 3);

        return new Manga(this, content.dir, content.en_name || content.another_name);
    }

    async _getMangas() {
        let mangaList = [];

        for (let page = 0; page <= 100; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }

        return mangaList;
    }

    async _getMangasFromPage(page) {
        const requestUrl = new URL('/api/search/catalog/', this.api);

        requestUrl.searchParams.set('ordering', '-rating');
        requestUrl.searchParams.set('count', '30');
        requestUrl.searchParams.set('page', page || '1');

        const request = new Request(requestUrl, this.requestOptions);
        const { content } = await this.fetchJSON(request);

        return content.map(item => {
            return {
                id: item.dir,
                title: item.en_name || item.rus_name,
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL('/api/titles/' + manga.id, this.api), this.requestOptions);
        const { content } = await this.fetchJSON(request, 3);

        const branch = content.branches[0];
        const pagesCount = content.count_chapters > 60 ? Math.trunc(content.count_chapters / 60) + 1 : 1;

        let chapters = [];
        for (let i = 1; i <= pagesCount; i++) {
            const tmp = await this._getChaptersFromPage(branch.id, i);
            chapters.push(...tmp);
        }
        return chapters;
    }

    async _getChaptersFromPage(branchId, page) {
        const requestUrl = new URL('/api/titles/chapters/', this.api);

        requestUrl.searchParams.set('branch_id', branchId);
        requestUrl.searchParams.set('count', '80');
        requestUrl.searchParams.set('ordering', '-index');
        requestUrl.searchParams.set('user_data', '1');
        requestUrl.searchParams.set('page', page || '1');

        const request = new Request(requestUrl, this.requestOptions);
        const data = await this.fetchJSON(request);

        const filterPaidChapters = data.content.filter(item => !item.is_paid && !item.is_bought);

        return filterPaidChapters.map(item => {
            return {
                id: item.id,
                title: `Vol. ${item.tome} Ch. ${item.chapter} ${item.name || item.name.length > 0 ? `- ${item.name}` : ''}`.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(`/api/titles/chapters/${chapter.id}`, this.api), this.requestOptions);
        const { content } = await this.fetchJSON(request, 3);

        let pages = [];
        for (let i = 0; i < content.pages.length; i++) {
            const page = content.pages[i];
            if (Array.isArray(page)) {
                for (let j = 0; j < page.length; j++) {
                    pages.push(page[j].link);
                }
            } else {
                pages.push(page.link);
            }
        }

        return pages.map(page => this.createConnectorURI(page));
    }
}

import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaOvh extends Connector {

    constructor() {
        super();
        super.id = 'mangaovh';
        super.label = 'MangaOvh';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://manga.ovh';
        this.api = 'https://api.manga.ovh';
    }

    async _getMangasFromPage(page) {
        const requestUrl = new URL('/book', this.api);
        requestUrl.searchParams.set('type', 'COMIC');
        requestUrl.searchParams.set('page', page);

        const request = new Request(requestUrl, this.requestOptions);
        const data = await this.fetchJSON(request, 3);

        return data.content.map(item => {
            return {
                id: item.id,
                title: item.name.en || Object.values(item.name).shift(),
            };
        });
    }

    async _getMangas() {
        let mangaList = [];

        const request = new Request(new URL('/book?type=COMIC', this.api), this.requestOptions);
        const data = await this.fetchJSON(request, 1);

        for (let page = 0; page <= data.totalPages; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }

        return mangaList;
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/').pop();

        const requestUrl = new URL('/book/' + slug, this.api);
        requestUrl.searchParams.set('type', 'COMIC');

        const request = new Request(requestUrl, this.requestOptions);
        const data = await this.fetchJSON(request, 3);

        return new Manga(this, data.id, data.name.en || Object.values(data.name).shift());
    }

    async _getChapters(manga) {
        const branchesRequest = new Request(new URL('/book/' + manga.id + '/branches', this.api), this.requestOptions);
        const branches = await this.fetchJSON(branchesRequest);

        let chapters = [];

        for (const branch of branches) {
            const tmp = await this._getChaptersFromBranch(branch.id);
            tmp.forEach(chapter => chapter.branchName = branch.translators.map(translator => {
                return translator.name;
            }).join(' & '));
            chapters.push(...tmp);
        }

        return chapters.map(item => {
            return {
                id: item.id,
                title: `Vol. ${item.volume} Ch. ${item.number} ${item.name ? `- ${item.name}` : ''} ${branches.length > 1 ? `(${item.branchName})` : ''}`.trim(),
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL('/chapter/' + chapter.id, this.api), this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.pages.map(page => this.createConnectorURI(page.image));
    }

    async _getChaptersFromBranch(branchId) {
        const request = new Request(new URL('/branch/' + branchId + '/chapters', this.api), this.requestOptions);
        return this.fetchJSON(request, 3);
    }
}
import MangaHub from './MangaHub.mjs';

export default class MangaKakalotFun extends MangaHub {

    constructor() {
        super();
        super.id = 'mangakakalotfun';
        super.label = 'MangaKakalotFun';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangakakalot.fun';

        this.path = 'mn01';
        this.mangaPerPage = 30;
    }

    async _getMangas() {
        const mangaList = [];
        for (let offset = 0; ; offset += this.mangaPerPage) {
            const gql = `{
                search(x: ${this.path}, q: "", genre: "all", mod: ALPHABET, count: true, offset: ${offset}) {
                    rows {
                        id, slug, title
                    }
                    count
                }
            }`;
            const data = await this.fetchGraphQL(this.apiURL, undefined, gql, undefined);
            const rows = data.search.rows;
            mangaList.push(...rows.map(manga => ({ id: manga.slug, title: manga.title })));
            if (mangaList.length >= data.search.count || rows.length < this.mangaPerPage) {
                break;
            }
        }
        return mangaList;
    }

    async _getPages(chapter) {
        const gql = `{
            chapter(x: ${this.path}, slug: "${chapter.manga.id}", number: ${chapter.id}) {
                pages
            }
        }`;
        let data = await this.fetchGraphQL(this.apiURL, undefined, gql, undefined);
        data = JSON.parse(data.chapter.pages);
        const prefix = data.p || '';
        const images = data.i || Object.values(data);
        return images.map(page => this.createConnectorURI(new URL(prefix + page, this.cdnURL).href));
    }
}
import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class LittleGarden extends Connector {
    constructor() {
        super();
        super.id = 'littlegarden';
        super.label = 'Little Garden';
        this.tags = ['manga', 'french', 'webtoon'];
        this.url = 'https://littlexgarden.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h2.super-title');
        const id = uri.pathname;
        const title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('/mangas', this.url), this.requestOptions);
        const urlList = await this.fetchDOM(request, 'div.listing a.no-select');

        return urlList.map((urlElement) => ({
            id: this.getRootRelativeOrAbsoluteLink(urlElement, this.url),
            title: urlElement.title.trim()
        }));
    }

    async _getChapters(manga) {
        const slug = manga.id.substr(1);
        const operationName = 'chapters';
        const query = 'query chapters($slug: String, $limit: Float, $skip: Float, $order: Float!, $isAdmin: Boolean!) {\n  chapters(limit: $limit, skip: $skip, where: {deleted: false, published: $isAdmin, manga: {slug: $slug, published: $isAdmin, deleted: false}}, order: [{field: "number", order: $order}]) {\nnumber}\n}\n';
        const variables = {
            slug: slug,
            order: -1,
            skip: 0,
            limit: 99999,
            isAdmin: true
        };

        const data = await this.fetchGraphQL(new URL('/graphql', this.url), operationName, query, variables);
        return data.chapters.map((chapter) => ({
            id: chapter.number,
            title: chapter.number.toString(),
            language: ''
        }));
    }

    async _getPages(chapter) {
        const mangaSlug = chapter.manga.id.substr(1);
        const operationName = 'pages';
        const query = 'query pages($slug: String, $number: Float, $isAdmin: Boolean!) {\n  chapters(limit: 1, skip: 0, where: {deleted: false, number: $number, published: $isAdmin, manga: {slug: $slug, published: $isAdmin, deleted: false}}) {\npages { original }}\n}\n';
        const variables = {
            slug: mangaSlug,
            number: chapter.id,
            isAdmin: true
        };

        const data = await this.fetchGraphQL(new URL('/graphql', this.url), operationName, query, variables);
        return data.chapters[0].pages.map((page) => this.getAbsolutePath(`/static/images/${page.original}`, this.url));
    }
}

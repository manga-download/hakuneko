import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Iken extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.apiPath = '/api';

        this.queryPages = 'main section img[src]:not([src=""])';
    }

    async _getMangas() {
        const mangaList = [];

        for (let page = 1, run = true; run; page++) {
            const list = await this._getMangasFromPage(page);
            list.length > 0 ? mangaList.push(...list) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`${this.apiPath}/query?page=${page}&perPage=1000`, this.url), this.requestOptions);
        const { posts } = await this.fetchJSON(request);

        return posts.map(manga => {
            return {
                id: manga.id,
                title: manga.postTitle
            };
        });
    }

    async _getChapters(manga) {
        const chapterList = [];

        for (let page = 0, run = true; run; page++) {
            const list = await this._getChaptersFromPage(manga.id, page);
            list.length > 0 ? chapterList.push(...list) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaId, page) {
        const request = new Request(new URL(`${this.apiPath}/chapters?postId=${mangaId}&skip=${page * 1000}&take=1000&order=desc&userid=`, this.url), this.requestOptions);
        const { post } = await this.fetchJSON(request);

        return post.chapters.map(chapter => {
            return {
                id: JSON.stringify({
                    series: chapter.mangaPost.slug,
                    chapter: chapter.slug,
                    paywalled: chapter.isLocked,
                    accessible: chapter.isAccessible
                }),
                title: `Chapter ${chapter.number} ${chapter.title || ''}`.trim()
            };
        });
    }

    async _getPages(chapter) {
        const id = JSON.parse(chapter.id);

        // chapter is paywalled
        if (id.paywalled) throw new Error('Chapter is paywalled. Please login.');

        // chapter is not accessible for some reason
        if (!id.accessible) throw new Error('The chapter is marked as not accessible.');

        const request = new Request(new URL(`/series/${id.series}/${id.chapter}`, this.url), this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const images = [...document.querySelectorAll('${this.queryPages}')];
                        resolve(images.map(image => image.src));
                    } catch (error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        return await Engine.Request.fetchUI(request, script);
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/')[2];
        const request = new Request(new URL(`${this.apiPath}/post?postSlug=${slug}`, this.url), this.requestOptions);
        const { post } = await this.fetchJSON(request);
        return new Manga({
            id: post.id,
            title: post.postTitle
        });
    }
}

import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Iken extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.api = undefined;
        this.path = '/api/query';

        this.queryPages = 'main section img[src]:not([src=""])';
    }

    async _getMangas() {
        let mangaList = [];

        for (let page = 1, run = true; run; page++) {
            let list = await this._getMangasFromPage(page);
            list.length > 0 ? mangaList.push(...list) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`${this.path}?page=${page}&perPage=1000`, this.api), this.requestOptions);
        let { posts } = await this.fetchJSON(request);

        return posts.map(element => {
            // need an example of a novel page to add support
            if (element.isNovel) throw new Error('Novels are not supported');

            return {
                id: element.id,
                title: element.postTitle
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];

        for (let page = 0, run = true; run; page++) {
            let list = await this._getChaptersFromPage(manga.id, page);
            list.length > 0 ? chapterList.push(...list) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaId, page) {
        let request = new Request(new URL(`/api/chapters?postId=${mangaId}&skip=${page * 1000}&take=1000&order=desc&userid=`, this.api), this.requestOptions);
        let { post } = await this.fetchJSON(request);

        return post.chapters.map(element => {
            return {
                id: JSON.stringify({
                    series: element.mangaPost.slug,
                    chapter: element.slug,
                    paywalled: element.isLocked,
                    accessible: element.isAccessible
                }),
                title: `Chapter ${element.number} ${element.title || ''}`.trim()
            };
        });
    }

    async _getPages(chapter) {
        let id = JSON.parse(chapter.id);

        // chapter is paywalled
        if (id.paywalled) throw new Error('Chapter is paywalled. Please login.');

        // chapter is not accessible for some reason
        if (!id.accessible) throw new Error('The chapter is marked as not accessible.');

        const request = new Request(new URL(`/series/${id.series}/${id.chapter}`, this.url), this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                try {
                    const images = [...document.querySelectorAll('${this.queryPages}')];
                    console.log(images);
                    resolve(images.map(image => image.src));
                } catch(error) {
                    reject(error);
                }
            });
        `;
        return await Engine.Request.fetchUI(request, script);
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/')[2];

        // get all manga until there is a matching slug
        // if the manga list is empty, simply break the loop
        for (let page = 1, run = true; run; page++) {
            let { count, id, title } = await this._getMangaFromURISlugSearch(page, slug);

            if (id) {
                return new Manga(this, id, title);
            } else if (count === 0) {
                run = false;
            }
        }
    }

    async _getMangaFromURISlugSearch(page, slug) {
        let request = new Request(new URL(`${this.path}?page=${page}&perPage=1000`, this.api), this.requestOptions);
        let { posts } = await this.fetchJSON(request);
        let length = posts.length;

        // if the list includes no manga, break loop
        if (length === 0) return { count: length };

        const post = posts.find(post => {
            return post.slug === slug;
        });

        return {
            id: post?.id,
            title: post?.postTitle,
            count: length
        };
    }
}
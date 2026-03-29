import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WebComicsApp extends Connector {

    constructor() {
        super();
        super.id = 'webcomicsapp';
        super.label = 'WebComicsApp';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.webcomicsapp.com';

        this.queryMangaTitleFromURI = 'div.book-info div.card-right h5';
        this.queryMangas = 'section.mangas div.row div.col-md-3 a';
        this.queryChapters = 'div.chapter-list-pc ul.chapter-contents li[class*="ch_"]';
        this.queryPages = 'div.read-container div.read-box source';
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
        this.titleRegex = /[\s|\p{P}]+/gu;
        this.token = null;
    }

    async _initializeConnector() {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(!!localStorage.tk ? localStorage.tk : null);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        this.token = await Engine.Request.fetchUI(request, script);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL('/genres.html?category=all', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            const mangaTitle = element.querySelector('h5').textContent.trim();
            return {
                id: `/comic/${mangaTitle.replace(this.titleRegex, '-')}/${this.getRelativeLink(element).match(/=(\w+)$/)[1]}`,
                title: mangaTitle
            };
        });
    }

    async _getChaptersWithLogin(manga) {
        if (!this.token) {
            throw new Error('Chapters not found (you are not logged in)!');
        }
        const mangaId = manga.id.match(/\/(\w+)$/)[1];
        const uri = new URL('/chapter/list', this.url);
        const request = new Request(uri, {
            ...this.requestOptions,
            method: 'POST',
            body: `mangaId=${mangaId}`
        });
        request.headers.set('token', this.token);
        request.headers.set('x-origin', this.url);
        request.headers.set('content-type', 'application/x-www-form-urlencoded');
        const data = await this.fetchJSON(request);
        if (data.success) {
            return data.data.chapters.map(chapter => {
                return {
                    id: !chapter.isPlusCp ? chapter.chapterId : `app-only-${chapter.chapterId}`,
                    title: chapter.cpNameInfo + (chapter.isPlusCp ? ' (App only)' : ''),
                    language: ''
                };
            });
        } else {
            throw new Error(data.msg);
        }
    }

    async _getChaptersWithoutLogin(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        const mangaId = manga.id.match(/\/(\w+)$/)[1];
        return data.map(chapter => {
            let path = '';
            if (parseInt(chapter.dataset.plus)) {
                path = `app-only-${chapter.dataset.index}`;
            } else {
                path = `/view/${manga.title.replace(this.titleRegex, '-')}/${chapter.dataset.index}/${mangaId}-${String(chapter.dataset.chn).replace(this.titleRegex, '-')}`;
            }
            return {
                id: this.getRootRelativeOrAbsoluteLink(path, this.url),
                title: chapter.dataset.chn.trim() + (path.startsWith('app-only-') ? ' (App only)' : ''),
                language: ''
            };
        });
    }

    async _getChapters(manga) {
        const promises = await Promise.allSettled([
            this._getChaptersWithLogin(manga),
            this._getChaptersWithoutLogin(manga)
        ]);
        return promises.find(promise => /fulfilled/i.test(promise.status)).value;
    }

    async _getPagesWithLogin(chapter) {
        if (!this.token) {
            throw new Error('Pages not found (you are not logged in)!');
        }
        const uri = new URL('/chapter/chapterDetail', this.url);
        const request = new Request(uri, {
            ...this.requestOptions,
            method: 'POST',
            body: new URLSearchParams({
                mangaId: chapter.manga.id.match(/\/(\w+)$/)[1],
                chapterId: chapter.id
            }).toString()
        });
        request.headers.set('token', this.token);
        request.headers.set('x-origin', this.url);
        request.headers.set('content-type', 'application/x-www-form-urlencoded');
        const data = await this.fetchJSON(request);
        if (data.success) {
            return data.data.pages.map(image => image.src);
        } else {
            throw new Error(data.msg);
        }
    }

    async _getPagesWithoutLogin(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(image => image.dataset['original'] || image.src);
    }

    async _getPages(chapter) {
        if (chapter.id.startsWith('app-only-')) {
            throw new Error('This chapter is only available in the Webcomics App at the moment!');
        }
        if (chapter.id.includes('/')) {
            return this._getPagesWithoutLogin(chapter);
        } else {
            return this._getPagesWithLogin(chapter);
        }
    }
}
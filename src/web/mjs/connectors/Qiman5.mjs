import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Qiman5 extends Connector {

    constructor() {
        super();
        super.id = 'qiman5';
        super.label = '奇漫屋 (Qiman5)';
        this.tags = [ 'webtoon', 'chinese'];
        this.config = {
            url: {
                label: 'URL',
                description: `This website's main domain doesn't always work, but has alternate domains.\nThis is the default URL which can also be manually set by the user.`,
                input: 'text',
                value: 'https://www.qiman58.com'
            }
        };
        this.queryPagesScript = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(newImgs);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
    }

    get url() {
        return this.config.url.value;
    }

    set url(value) {
        if (this.config && value) {
            this.config.url.value = value;
            Engine.Settings.save();
        }
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'header span.comic-name');
        const id = uri.href.match(/([\d]+)\//)[1];
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/ajaxf/?page_num=${page}&type=1`, this.url);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-referer', this.url);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        try {
            //website doesnt return JSON on last page , so, try catch
            const data = await this.fetchJSON(request);
            return data.map(element => {
                return {
                    id: element.id,
                    title: element.name.trim()
                };
            });
        } catch(error) {
            return [];
        }
    }

    async _getChapters(manga) {
        let chaptersList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chaptersList.push(...chapters) : run = false;
        }
        return chaptersList;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL('/bookchapter/', this.url);

        const request = new Request(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-referer': uri.href,
                'x-origin': this.url,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                id: manga.id,
                id2 : page
            }).toString()
        });

        try {
            //website doesnt return JSON on last page , so, try catch
            const data = await this.fetchJSON(request);
            return data.map(element => {
                return {
                    id: +element.id,
                    title: element.name.trim()
                };
            });
        } catch(error) {
            return [];
        }
    }

    async _getPages(chapter) {
        const uri = new URL(`/${chapter.manga.id}/${chapter.id}.html`, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, this.queryPagesScript);
    }

}

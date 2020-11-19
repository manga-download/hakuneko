import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Qiman5 extends Connector {

    constructor() {
        super();
        super.id = 'qiman5';
        super.label = '奇漫屋 (Qiman5)';
        this.tags = [ 'webtoon', 'chinese'];
        this.url = 'http://www.qiman6.com';

        this.path = '/rank/1-%PAGE%.html';
        this.queryMangas = 'div.mainForm div.updateList div.bookList_3 div.ib p.title a';
        this.queryChapters = 'div.chapterList div#chapter-list1 a.ib';
        this.queryMangaTitle = 'div.container div.mainForm div.comicInfo div.ib.info h1';
    }

    // NOTE: Website doesn't provide full manga list
    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let button = document.querySelector('.moreChapter');
                        if(button) {
                            button.click();
                        }
                        setTimeout(() => {
                            let chapterList = [...document.querySelectorAll('${this.queryChapters}')].map(element => {
                                return {
                                    id: element.pathname,
                                    title: element.text.trim()
                                };
                            });
                            resolve(chapterList);
                        }, 5000);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const uri = new URL(`${manga.id}`, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        const script = `
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
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(element => this.getAbsolutePath(element, request.url));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

}
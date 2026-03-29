import SinMH from './templates/SinMH.mjs';

export default class Qiman5 extends SinMH {

    constructor() {
        super();
        super.id = 'qiman5';
        super.label = '奇漫屋 (Qiman5)';
        this.tags = [ 'webtoon', 'chinese'];
        this.url = 'http://www.qiman6.com';

        this.path = '/rank/1-%PAGE%.html';
        this.queryMangas = 'div.mainForm div.updateList div.bookList_3 div.ib p.title a';
        this.queryChapters = 'div.chapterList div#chapter-list1 a.ib';
        this.queryManga = 'div.container div.mainForm div.comicInfo div.ib.info h1';
        this.queryChaptersScript = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let button = document.querySelector('.moreChapter');
                        if(button) {
                            button.click();
                        }
                        setTimeout(() => {
                            try {
                                let chapterList = [...document.querySelectorAll('${this.queryChapters}')].map(element => {
                                    return {
                                        id: element.pathname,
                                        title: element.text.trim()
                                    };
                                });
                                resolve(chapterList);
                            } catch(error) {
                                reject(error);
                            }
                        }, 6000);
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
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

}
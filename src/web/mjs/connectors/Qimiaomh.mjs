import Connector from '../engine/Connector.mjs';

export default class Qimiaomh extends Connector {

    constructor() {
        super();
        super.id = 'qimiaomh';
        super.label = '奇妙漫画 (Qimiaomh)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.qimiaomh.com';

        this.queryMangas = 'div.wrapper div.mt20 div.classification h2 a';
        this.queryChapters = 'div.comic-content-list ul.comic-content-c li.tit a';
        this.queryPages = 'div.cartoon div.loadimg img.man_img';
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/list-1------updatetime--' + page + '.html', this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        let checkData = await this.fetchDOM(request, 'div.paging ul li a');
        let result = {
            data: null,
            check: null
        };

        result.data = data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });

        result.check = checkData.find(element => {
            return element.href == "javascript:void(0)";
        });

        if(page === 1)result.check = null;

        return result;
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let result = await this._getMangasFromPage(page);
            !result.check ? mangaList.push(...result.data) : run = false;
        }
        return mangaList;
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            const title = element.title;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        const images = [...document.querySelectorAll('${this.queryPages}')];
                        resolve(images.map(image => image.dataset['src'] || image.dataset['data-src'] || image.src));
                    } catch(error) {
                        reject(error);
                    }
                }, 1000);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
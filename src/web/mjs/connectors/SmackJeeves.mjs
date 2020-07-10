import Connector from '../engine/Connector.mjs';

export default class SmackJeeves extends Connector {

    constructor() {
        super();
        super.id = 'smackjeeves';
        super.label = 'Smack Jeeves';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.smackjeeves.com';
        this.he = require('he');
    }

    async _getCategories( url) {
        const script = `
            new Promise((resolve, reject) => {
                try {
                    resolve(cmnData);
                } catch(error) {
                    reject(error);
                }
            });
        `;
        const request = new Request(new URL(url), this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);

        return data.navigation.items;
    }

    async _getMangas() {
        const categories = await this._getCategories( new URL('/discover?type=genre', this.url));

        let manga_list = [];
        for (const category of categories) {
            let url = new URL('/api/getTitleListByGenreDiscover', this.url);
            url.searchParams.set('genre', category.val);
            url.searchParams.set('order', 'newarriva');

            let pages = 1;
            for (let page = 1; page <= pages; page++) {
                url.searchParams.set('page', page);
                const data = await this._fetchPOST(url);
                pages = data.result.totalPageCnt;

                manga_list.push(...data.result.list.map(element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(element.titleUrl, this.url),
                        title: this.he.decode( element.title ).trim()
                    };
                }));
            }
        }

        return manga_list;
    }

    async _getChapters(manga) {
        const url = new URL('/api'+manga.id, this.url);
        const data = await this._fetchPOST(url);

        return data.result.list.map(element => {
            return {
                id: element.articleUrl,
                title: this.he.decode( element.articleTitle ).trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                try {
                    resolve(cmnData.comicData);
                } catch(error) {
                    reject(error);
                }
            });
        `;
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);

        return data.map(element => {
            return element.url;
        });
    }

    async _fetchPOST( uri) {
        const request = new Request(new URL(uri.pathname, this.url), {
            method: 'POST',
            body: uri.searchParams.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                // 'x-referer': this.url
            }
        });
        const data = await fetch(request);
        return data.json();
    }
}
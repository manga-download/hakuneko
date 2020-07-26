import Connector from '../engine/Connector.mjs';

export default class SmackJeeves extends Connector {

    constructor() {
        super();
        super.id = 'smackjeeves';
        super.label = 'Smack Jeeves';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.smackjeeves.com';
    }

    async _getCategories( url) {
        const script = `
            new Promise(resolve => resolve(cmnData.navigation.items.map(item => item.val)));
        `;
        const request = new Request(new URL(url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }

    async _getMangas() {
        const categories = await this._getCategories( new URL('/discover?type=genre', this.url));

        let manga_list = [];
        for (const category of categories) {
            let form = new URLSearchParams();
            form.set('genre', category);
            form.set('order', 'newarriva');

            let pages = 1;
            for (let page = 1; page <= pages; page++) {
                form.set('page', page);
                const data = await this._fetchPOST(new URL('/api/getTitleListByGenreDiscover', this.url), form);
                pages = data.result.totalPageCnt;

                manga_list.push(...data.result.list.map(item => {
                    // decode html entities
                    let title = document.createElement('div');
                    title.innerHTML = item.title;
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(item.titleUrl, this.url),
                        title: title.textContent.trim()
                    };
                }));
            }
        }

        return manga_list;
    }

    async _getChapters(manga) {
        const url = new URL('/api'+manga.id, this.url);
        const data = await this._fetchPOST(url, url.searchParams);

        return data.result.list.map(item => {
            // decode html entities
            let title = document.createElement('div');
            title.innerHTML = `#${item.articleNo} - ${item.articleTitle}`;
            return {
                id: item.articleUrl,
                title: title.textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(resolve => resolve(cmnData.comicData.map(page => page.url || page)));
        `;
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _fetchPOST( uri, form) {
        const request = new Request(new URL(uri, this.url), {
            method: 'POST',
            body: form.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const data = await fetch(request);
        return data.json();
    }
}
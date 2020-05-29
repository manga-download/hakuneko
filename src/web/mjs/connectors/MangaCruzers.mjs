import Connector from '../engine/Connector.mjs';

export default class MangaCruzers extends Connector {

    constructor() {
        super();
        super.id = 'mangacruzers';
        super.label = 'MangaCruzers';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangacruzers.com';
    }

    async _getMangas() {
        let uri = new URL('/read-manga/', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.entry-content div.su-table table tr:not(:first-of-type)');
        return data.map(element => {
            let title = element.querySelector('td:first-of-type');
            let link = element.querySelector('td:last-of-type a');
            return {
                id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                title: title.textContent.trim()
            };
        }).filter(manga => !manga.title.toLowerCase().startsWith('download '));
    }

    async _getChapters(manga) {
        let chapterList = [];
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'a[href*="/manga/"]');
        data = data.filter(element => element.text.toLowerCase() === 'view all chapters')
            .map(element => this.getRootRelativeOrAbsoluteLink(element, this.url));
        if(data.length === 0) {
            data.push(uri.href);
        }
        data = [...new Set(data)].reduce((accumulator, page) => {
            let seasons = page.match(/season-(\d+)$/);
            if(seasons) {
                let count = parseInt(seasons[1]);
                seasons = [...new Array(count).keys()].map(p => page.replace(/season-(\d+)$/ ,`season-${p+1}`));
                return [ ...accumulator, ...seasons.reverse() ];
            } else {
                return [ ...accumulator, page ];
            }
        }, []);
        for(let page of data) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let uri = new URL(page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card-table a[href*="/chapter/"], div.w-full a[href*="/chapter/"]');
        let isTable = data.filter(element => element.text.toLowerCase() !== 'read').length === 0;
        return data
            .map(element => {
                // TODO: extract and replace manga title from page and remove it from chapter title
                let title = isTable ? element.closest('tr').querySelector('td').textContent : element.text;
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: title.replace(manga.title, '').trim(),
                    language: ''
                };
            })
            .filter(manga => {
                let title = manga.title.toLowerCase();
                return title !== 'read' && !title.startsWith('click me');
            });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'source.js-page, source.pages__img');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
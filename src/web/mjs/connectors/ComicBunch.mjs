import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicBunch extends Connector {

    constructor() {
        super();
        super.id = 'comicbunch';
        super.label = 'コミックバンチ (ComicBunch)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.comicbunch.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, '#comics > h2'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        const uri = new URL('/comics', this.url);
        const request = new Request(uri, this.requestOptions);
        let data = (await this.fetchDOM(request, 'select[name="sort"] option')).filter(item => item.value != '').map(item => item.value.substr(3));
        for(var i = 0; i < data.length; i++) {
            let mangas = await this._getMangasFromPage(data[i]);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/comics/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '#comics_list > dl');
        return data.filter(element => element.querySelector('dd a[class*="read_more"]')).map(element => {
            return {
                id: element.querySelector('dd a.read_more').pathname,
                title: element.querySelector('dd h3').textContent.trim()
            };
        }).filter(x => x.id.includes('/manga/bunch/' || x.id.includes('/manga/end/')));
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#comics div.backnumber a');
        return data.filter(element => element.pathname.includes('view')).map(element => {
            return {
                id: uri.href + element.pathname,
                title: element.textContent.trim() + (element.pathname.includes('/other/') ? ' (other)' : ''),
                language: element.pathname.includes('/other/') ? 'other' : 'jp'
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.guard source');
        return data.map(element => uri.href + new URL(element.src).pathname );
    }
}
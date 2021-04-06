import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SixParkbbsWeb extends Connector {

    constructor() {
        super();
        super.id = 'sixparkbbsweb';
        super.label = '6parkbbs (新❀华漫)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://web.6parkbbs.com';

        this.path = '/index.php?app=forum&act=bbs&bbsid=2032&p=%PAGE%'
        this.pathMatch = /p=(\d+)/;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.c-box p.c-box-h b');
        let id = this.getRootRelativeOrAbsoluteLink(uri, request.url);
        let title = data[0].textContent.replace(/^\s*\[.*?\]\s*/g, '').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.path.replace('%PAGE%', 1000), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#d_list_page a:nth-last-child(2)');
        let pageCount = parseInt(data[0].href.match(this.pathMatch)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList.filter(ele=> {
            return ele != undefined;
        });
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path.replace('%PAGE%', `${page}`), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#d_list div.repl-list-one a:nth-child(1)');
        return data.map(element => {
            if(element.text.match(/.*\[漫画\]/)){
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim()
                };
            }
            return;
        });
    }

    async _getChapters(manga) {
        let chapterList = [null]
        chapterList = chapterList.map(element =>{
            return{
                id: manga.id,
                title: manga.title
            }
        });
        return chapterList;
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.cen-main div.c-box-m center source');
        return data.map(element => this.getAbsolutePath(element.attributes[0].value, request.url));
    }
}
import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicFire extends SpeedBinb {

    constructor() {
        super();
        super.id = 'comicfire';
        super.label = 'COMIC ファイア (Comic Fire/Hobby Japan)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.hobbyjapan.co.jp/comic';

        this.queryManga = 'div.series_list_box div.cover_contents dl dt a';

        this.queryChapters = 'li.pconly h3 a';
        this.queryChapterTitles = 'li.episode';

    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split('|')[0].trim();
        return new Manga(this, id.substr(6), title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/series', this.requestOptions); //ongoing series
        let data = await this.fetchDOM(request, this.queryManga);
        request = new Request(this.url + "/series/series_end.html"); //completed series
        data = data.concat(await this.fetchDOM(request, this.queryManga));
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url).substr(6),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let titles = await this.fetchDOM(request, this.queryChapterTitles);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: titles.shift().textContent.trim()
            };
        });
    }

    _getPageList( manga, chapter, callback ) {
        let ch = {
            id: chapter.id,
            title: chapter.title,
            language: chapter.language
        };
        if(chapter.id.includes("SWF")){ //legacy format; older chapters may use this
            ch.id = "http://tachiyomi.yomeru-hj.net/comic/" + ch.id.substr(17).replace("_SWF_Window.html","");
            let request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                    let xmlDOM = request.responseXML;
                    let pageList = [];
                    let n = parseInt(xmlDOM.getElementsByTagName("total")[0].textContent);
                    for (let i = 1; i <= n; i++){ 
                        pageList.push(ch.id + "books/images/3.5/" + i + ".jpg");
                    }
                    callback(undefined, pageList);
                }
            };
            request.open("GET", ch.id + 'books/db/book.xml', true);
            request.send();
        }else{ //speedbinb
            super._getPageList( manga, ch, callback );
        }
    }
}
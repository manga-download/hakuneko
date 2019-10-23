import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SakuraManga extends Connector {

    constructor() {
        super();
        super.id = 'sakuramanga';
        super.label = 'Sakura Manga';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://sakuramanga.net';
        this.list = '/japanese-manga-list';
        this.japanese = 'japanese-manga';
        this.english = 'truyen-tranh-tieng-anh-english-manga';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.substring(0, data[0].text.indexOf("- Sakura Manga")).trim();
        return new Manga(this, id, title);
    }

    async _getMangaList(callback) {
        try {
            let request = new Request(this.url + this.list, this.requestOptions);
            let data = await this.fetchDOM(request, 'ul[id*="menu-menu-sidebar-"] li[id*="menu-item-"] a');
            let mangaList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim()
                };
            });
            callback(null, mangaList);
        } catch (error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'article[id*="post-"] header div a');
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.substring(element.text.lastIndexOf("chap")).trim(),
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch (error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.entry-content noscript');
            let copy = [];
            data.forEach(function (item) {
                //create new variable to work with
                let str = item.innerText;
                //push only the url of "src" into the copy array
                copy.push(str.substring(str.lastIndexOf("src='") + 5, str.lastIndexOf("g'") + 1));
            });
            let pageList = copy.map(element => this.getAbsolutePath(element, request.url));
            callback(null, pageList);
        } catch (error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}
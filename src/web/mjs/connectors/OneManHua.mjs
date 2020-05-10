import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OneManHua extends Connector {

    constructor() {
        super();
        super.id = 'onemanhua';
        super.label = 'Oh漫画';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.ohmanhua.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:comic:book_name"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/show', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.fed-page-info a.show-page-jump');
        let pageCount = parseInt(data[0].dataset.total.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/show?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.fed-list-info li.fed-list-item a.fed-list-title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.all_data_list ul li a');
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                if(!image_info.img_type) {
                    let images = [];
                    let uri = new URL('//' + lines[chapter_id].use_line + '/comic/' + mh_info.imgpath, window.location.origin);
                    for(let index = mh_info.startimg; index <= mh_info.totalimg; index++) {
                        let file = ('000' + index + '.jpg').slice(-8);
                        images.push(new URL(file, uri.href).href);
                    }
                    resolve(images);
                } else {
                    resolve(__images_yy)
                }
            });
        `;
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}
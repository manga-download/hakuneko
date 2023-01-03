import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kuaikanmanhua extends Connector {

    constructor() {
        super();
        super.id = 'kuaikanmanhua';
        super.label = 'Kuaikanmanhua';
        this.tags = ['manga', 'chinese'];
        this.url = 'https://www.kuaikanmanhua.com';
        this.list = '/tag/0';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split('|')[0].trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL(this.list, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:nth-last-child(2) a' );
        const pageCount = parseInt( data[0].text.match( /\d+/ )[0] );
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.list + '?page='+ page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.tagContent div a', 5);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const chapterList = await this.resolveChapterList(manga);
        if (chapterList.length < 1) console.error('No chapters found !', this);
        return chapterList;
    }

    async resolveChapterList(manga) {
        const script = `
            new Promise(resolve => {
            	  let pages = [];
	            	  try {
		                pages = __NUXT__.data[0].comics.map( comic => {
		                    return {
		                        id : '/web/comic/'+comic.id,
		                        title: comic.title.trim()
		                    };
		                }).reverse();
            	  } catch(error) {
		                pages = __NUXT__.data[0].comicList.map( comic => {
		                    return {
		                        id : '/web/comic/'+comic.id,
		                        title: comic.title.trim()
		                    };
		                }).reverse();
            	  }

                resolve(pages);
            });
            `;
        const request = new Request(this.url + manga.id, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        const script = `
        new Promise(resolve => {
            resolve( __NUXT__.data[0].comicInfo.comic_images.map(img => img.url));
        });
        `;
        const request = new Request(this.url + chapter.id, this.requestOptions);
        request.headers.set('x-user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
        return await Engine.Request.fetchUI(request, script);
    }
}

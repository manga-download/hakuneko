import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KissComic extends Connector {

    constructor() {
        super();
        super.id = 'kisscomic';
        super.label = 'ReadComicOnline.li (KissComic)';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://readcomiconline.li';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.barContent a.bigChar');
        return new Manga(this, uri.pathname, data[0].text.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/ComicList?page=' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list-comic div.item a, div.item-list div.group div.col.info a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.episodeList table.listing tr td:first-of-type a, div.section ul.list li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/read online/i, '').replace(manga.title, '').trim(),
                language: 'en'
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(
                            Array.from(document.querySelectorAll('#divImage img'))
                                .map(img => (img.src || '').replace(/=s\\d+/, '=s0'))
                                .filter(Boolean)
                        )
                    } catch (err) {
                        reject(err);
                    }
                }, 1000);
            });
        `;

        const uri = new URL(chapter.id, this.url);
        uri.searchParams.set('readType', 1);
        uri.searchParams.set('quality', 'hq');
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script, 60000, true);
    }
}

import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DoujinDesu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujindesu';
        super.label = 'DoujinDesu';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://doujindesu.xxx';
        this.path = '/komik-list/page/%PAGE%/';

        this.querMangaTitleFromURI = 'div#infoarea div.post-body h1.entry-title';
        this.queryMangas = '#main .relat .animepost .animposx a';
        this.queryChapters = 'div#chapter_list div.epsleft span.lchx a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }

    // NOTE: Fallback to pagination since '/komik-list/?list' empty
    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const path = page > 1 ? this.path : '/komik-list/';
            let mangas = await this._getMangasFromPage(path, page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(path, page) {
        const uri = new URL(path.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }
}
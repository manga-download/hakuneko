import WordPressMangastream from './templates/WordPressMangastream.mjs';

// Customized version of WordPressMangastream
export default class Komiku extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiku';
        super.label = 'Komiku';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://komiku.co.id';
        this.path = '/manga/page/';

        this.queryMangas = 'div.daftar div.bge div.kan > a.popunder';
        this.queryChapters = 'table.chapter tbody tr td.judulseries a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div#Baca_Komik img[src]:not([src=""])';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        try {
            const uri = new URL(this.path + page + '/', this.url);
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchDOM(request, this.queryMangas);
            return data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim()
                };
            });
        } catch(error) {
            if(error.message.includes('404')) {
                return [];
            } else {
                throw new Error(error);
            }
        }
    }

    async _getPages(chapter) {
        let pageList = await super._getPages(chapter);
        return pageList.filter(link => !link.endsWith('New-Project-2.jpg'));
    }
}
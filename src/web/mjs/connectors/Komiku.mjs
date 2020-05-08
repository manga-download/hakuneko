import WordPressEManga from './templates/WordPressEManga.mjs';

// Customized version of WordPressEManga
export default class Komiku extends WordPressEManga {

    constructor() {
        super();
        super.id = 'komiku';
        super.label = 'Komiku';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://komiku.co.id';
        this.path = '/daftar-komik/?list';

        this.queryMangas = 'div#a-z ol li.ranking1 h4';
        this.queryChapters = 'table.chapter tbody tr td.judulseries a';
        this.queryPages = 'div#Baca_Komik source[src]:not([src=""])';
    }

    async _getMangas() {
        let request = new Request(new URL(this.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.trim()
            };
        });
    }
}
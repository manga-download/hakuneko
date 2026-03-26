import MangaFox from './MangaFox.mjs';

export default class MangaHere extends MangaFox {

    constructor() {
        super();
        super.id = 'mangahere';
        super.label = 'MangaHere';
        this.url = 'https://www.mangahere.cc';
    }

    async _getMangas() {
        let uri = new URL(`/mangalist/`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.browse-new-block-list div.browse-new-block p.browse-new-block-content a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }
}
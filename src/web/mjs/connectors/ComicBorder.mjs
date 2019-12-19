import CoreView from './templates/CoreView.mjs';

export default class ComicBorder extends CoreView {

    constructor() {
        super();
        super.id = 'comicborder';
        super.label = 'コミックボーダー (ComicBorder)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comicborder.com';
    }

    async _getMangas() {
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.index-list-all li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.lastChild.textContent.trim()
            };
        });
    }
}
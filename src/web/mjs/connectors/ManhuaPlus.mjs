import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class ManhuaPlus extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://manhuaplus.com';
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.blocks-gallery-grid li.blocks-gallery-item figure noscript');
        return data.map(element => {
            element = this.createDOM(element.innerText).querySelector('source');
            let url = this.getAbsolutePath(element.dataset.fullUrl || element.dataset.src || element, request.url);
            return this._getImageURL(request.url, url);
        });
    }
}
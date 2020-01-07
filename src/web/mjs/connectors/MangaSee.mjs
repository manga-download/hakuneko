import Connector from '../engine/Connector.mjs';

// Very similar visual to MangaLife (newer viewer)
export default class MangaSee extends Connector {

    constructor() {
        super();
        super.id = 'mangasee';
        super.label = 'MangaSee';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangaseeonline.us';
    }

    async _getMangas() {
        let request = new Request(this.url + '/directory/', this.requestOptions);
        let data = await this.fetchDOM(request, '#content p a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, '.chapter-list a[class="list-group-item"]');
        return data.map(element => {
            let title = element.querySelector('span.chapterLabel').textContent;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url).replace(/-page-\d+/, ''),
                title: title.replace(manga.title, '').trim(),
                language: 'en'
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.fullchapimage source');
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
    }

    async _handleConnectorURI( payload ) {
        let request = new Request( payload, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        super._applyRealMime(data);
        return data;
    }
}
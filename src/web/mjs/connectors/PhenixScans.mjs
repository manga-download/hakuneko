import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PhenixScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'phenixscans';
        super.label = 'Phenix Scans';
        this.tags = [ 'manga', 'french', 'scanlation' ];
        this.url = 'https://phenixscans.fr';
        this.path = '/manga/list-mode';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        return pages.map(page => this.createConnectorURI(page));
    }
}

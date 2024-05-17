import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class NightScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'nightscans';
        super.label = 'NightScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://night-scans.net';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).map(picture => this.createConnectorURI(picture));
    }

}

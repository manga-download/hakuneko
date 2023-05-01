import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class NightScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'nightscans';
        super.label = 'NightScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://nightscans.org';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        return (await super.getPages(chapter)).map(picture => this.createConnectorURI(picture));
    }

}

import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaHubFR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangahubfr';
        super.label = 'MangaHub.FR';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://mangahub.fr';
    }
}
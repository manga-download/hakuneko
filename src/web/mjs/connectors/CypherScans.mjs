import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class CypherScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'cypherscans';
        super.label = 'Cypher Scans';
        this.tags = [ 'manga', 'manhwa', 'manhua', 'english' ];
        this.url = 'https://cypherscans.xyz';
        this.path = '/manga/list-mode/';
    }
}
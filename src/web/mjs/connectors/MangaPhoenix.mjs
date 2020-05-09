import WordPressMadara from './templates/WordPressMadara.mjs';


export default class MangaPhoenix extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangaphoenix';
        super.label = 'Manga Phoenix';
        this.tags = [ 'manga', 'high-quality', 'turkish' ];
        this.url = 'https://mangaphoenix.com';
        this.language = 'tr';
    }
}
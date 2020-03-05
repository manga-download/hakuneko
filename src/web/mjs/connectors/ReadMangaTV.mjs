import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReadMangaTV extends WordPressMadara {

    constructor() {
        super();
        super.id = 'readmangatv';
        super.label = 'readmanga.tv';
        this.tags = [ 'manga', 'novel', 'hentai', 'porn', 'japanese' ];
        this.url = 'https://readmanga.tv';
    }
}
import TuMangaOnline from './TuMangaOnline.mjs';

export default class LectorManga extends TuMangaOnline {

    constructor() {
        super();
        super.id = 'lectormanga';
        super.label = 'LectorManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://lectormanga.com';
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }
}
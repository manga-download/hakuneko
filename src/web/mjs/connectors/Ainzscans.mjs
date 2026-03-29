import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ainzscans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ainzscans';
        super.label = 'Ainz Scans';
        this.tags = [ 'webtoon', 'indonesian', 'scanlation' ];
        this.url = 'https://ainzscans.net';
        this.path = '/series/list-mode';
    }

    async _getMangas() {
        return (await super._getMangas()).map(manga => {
            return {
                id : manga.id,
                title : manga.title.replace('Bahasa Indonesia', '').trim()
            };
        });
    }
}

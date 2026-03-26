import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class WoopRead extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'woopread';
        super.label = 'WoopRead';
        this.tags = [ 'manga', 'novel', 'english' ];
        this.url = 'https://woopread.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }

    async _getChapters(manga) {
        const chapters = await super._getChapters(manga);
        return chapters.filter(chapter => chapter.id !== manga.id);
    }
}
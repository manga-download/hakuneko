import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class AstralLibrary extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'astrallibrary';
        super.label = 'Astral Library';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://www.astrallibrary.net';

        this.queryMangas = 'div.post-title h3 a:last-of-type';
        this.novelObstaclesQuery = 'div.ad';
    }

    async _getChapters(manga) {
        const chapters = await super._getChapters(manga);
        return chapters.filter(chapter => !/^http/.test(chapter.id) && chapter.title !== '');
    }
}
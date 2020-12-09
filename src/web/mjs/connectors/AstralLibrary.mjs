import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class AstralLibrary extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'astrallibrary';
        super.label = 'Astral Library';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://astrallibrary.net';

        this.novelObstaclesQuery = 'div.ad';
        this.queryMangas = 'div.item-summary';
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('page/'+page+1,'https://www.astrallibrary.net/manga-tag/manga/'));
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('.list-chapter a'), request.url),
                title: element.querySelector('a').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chap = manga.id.match(/(\d+)\/$/)[1]
        let arr = new Array(Number(chap)+1).fill(0)
        return arr.map((_,ind) => {
            return {
                id: manga.id.replace(/(\d+)\/$/,ind),
                title: 'chapter '+ind
            }
        });
    }
}
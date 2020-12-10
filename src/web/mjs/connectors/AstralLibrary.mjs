import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class AstralLibrary extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'astrallibrary';
        super.label = 'Astral Library';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://www.astrallibrary.net';

        this.novelObstaclesQuery = 'div.ad';
        this.queryMangas = 'h3.h5 a';
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL('/manga-tag/manga/page/'+(page+1), this.url));
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id:  this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(this.url);
        uri.searchParams.set('post_type', 'wp-manga');
        uri.searchParams.set('s', manga.title);
        const request = new Request(uri, this.requestOption);
        const data = await this.fetchDOM(request, 'div.latest-chap span.chapter a');
        const chap = data[0].text.match(/(\d+)$/)[1];
        return new Array(Number(chap)+1).fill(0).map((_, ind) => {
            return {
                id: new URL(manga.id+'/chapter-'+ind, this.url),
                title: 'chapter '+ind
            };
        });
    }
}
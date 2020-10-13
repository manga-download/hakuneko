import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AsuraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'asurascans';
        super.label = 'Asura Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://asurascans.com';

        this.path = '/manga/';
        this.queryMangas = 'div#content div.postbody div.listupd div.bs div.bsx a';
        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve(ts_reader.params.sources.pop().images);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }
}
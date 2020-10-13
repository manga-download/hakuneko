import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Rawkuma extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'rawkuma';
        super.label = 'Rawkuma';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://rawkuma.com';

        this.path = '/manga/list-mode/';
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
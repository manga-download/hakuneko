import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Boosei extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'boosei';
        super.label = 'Boosei';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://boosei.net';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve) => {
                resolve(ts_reader_control.getImages());
            });
        `;
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.getAbsolutePath(link, request.url));
    }
}

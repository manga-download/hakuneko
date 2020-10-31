import FlatManga from './templates/FlatManga.mjs';

export default class TruyenTranhAudio extends FlatManga {

    constructor() {
        super();
        super.id = 'truyentranhaudio';
        super.label = 'Truyện tranh audio';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'http://truyentranhaudio.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'ul.list-chapters > a';
        this.queryChapterTitle = 'div.chapter-name';
        this.language = 'vn';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-content > source');
        return data.map(element => {
            const url = this.getAbsolutePath(element.dataset.src || element, request.url);
            if(url.includes('forumnt.com')) {
                const uri = new URL('/proxy/proxy.php', this.url);
                uri.searchParams.set('url', url);
                return uri.href;
            } else {
                return url;
            }
        });
    }
}
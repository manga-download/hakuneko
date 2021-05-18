import FlatManga from './templates/FlatManga.mjs';

export default class ManhuaScan extends FlatManga {

    constructor() {
        super();
        super.id = 'manhuascan';
        super.label = 'ManhuaScan';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhuascan.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async resolve => {
                const response = await fetch('/app/manga/controllers/cont.chapterServer1.php', {
                    method: 'POST',
                    body: 'id=' + chapter_id,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                const data = await response.json();
                const content = CryptoJSAesJson.decrypt(data.content, '4xje8fvkub2d3mb5cy9rv661zyjakbcn');
                resolve(content.split('http').slice(1).map(link => 'http' + link));
            });
        `;
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}
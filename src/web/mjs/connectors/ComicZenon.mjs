import CoreView from './templates/CoreView.mjs';

export default class ComicZenon extends CoreView {

    constructor() {
        super();
        super.id = 'comiczenon';
        super.label = 'ゼノン編集部 (Comic Zenon)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-zenon.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series/zenon', '/series/zenyon', '/series/tatan', '/series/oneshot' ];
        this.queryManga = 'div.serial-contents section div.series-item h4 > a';
        this.queryMangaTitle = undefined;

    }
}

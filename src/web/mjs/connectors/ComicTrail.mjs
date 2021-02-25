import CoreView from './templates/CoreView.mjs';

export default class ComicTrail extends CoreView {

    constructor() {
        super();
        super.id = 'comictrail';
        super.label = 'Comic Trail (コミックトレイル)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-trail.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series' ];
        this.queryManga = '#page-comicTrail-serial-serial > div div a';
        this.queryMangaTitle = 'h4';
    }

}

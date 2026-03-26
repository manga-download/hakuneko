import CoreView from './templates/CoreView.mjs';

export default class ComicTrail extends CoreView {

    constructor() {
        super();
        super.id = 'comictrail';
        super.label = 'Comic Trail (コミックトレイル)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-trail.com';

        this.path = [ '/series' ];
        this.queryManga = '#page-comicTrail-serial-serial > div div a';
        this.queryMangaTitle = 'h4';
    }

}
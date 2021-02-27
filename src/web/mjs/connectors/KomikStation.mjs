import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikStation extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikstation';
        super.label = 'KomikStation';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.komikstation.com';
        this.path = '/manga/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
    }
}
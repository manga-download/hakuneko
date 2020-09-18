import WordPressMangastream from './templates/WordPressMangastream.mjs';

/**
 *
 */
export default class KomikCast extends WordPressMangastream {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikcast';
        super.label = 'KomikCast';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikcast.com';
        this.path = '/daftar-komik/?list';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryPages = 'div#readerarea source[src^="http"], div.separator source[src^="http"]';
    }
}
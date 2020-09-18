import WordPressMangastream from './templates/WordPressMangastream.mjs';

/**
 *
 */
export default class MangaSeno extends WordPressMangastream {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaseno';
        super.label = 'Mangaseno';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangaseno.com';
        this.path = '/manga-lists/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
    }
}
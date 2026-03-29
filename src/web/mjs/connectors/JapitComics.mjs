import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class JapitComics extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'japitcomics';
        super.label = 'Japit Comics';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://j-comics.ru';

        this.language = 'ru';
    }
}
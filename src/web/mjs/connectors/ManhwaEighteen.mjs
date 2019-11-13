import FlatManga from './templates/FlatManga.mjs';

export default class ManhwaEighteen extends FlatManga {

    constructor() {
        super();
        super.id = 'manhwa18-int';
        super.label = 'Manhwa 18 (.net)';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwa18.net';
        this.requestOptions.headers.set('x-referer', this.url);

        this.language = '';
    }
}
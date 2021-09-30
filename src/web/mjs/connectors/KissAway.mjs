import FlatManga from './templates/FlatManga.mjs';

export default class KissAway extends FlatManga {

    constructor() {
        super();
        super.id = 'kissaway';
        super.label = 'KLManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://klmanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
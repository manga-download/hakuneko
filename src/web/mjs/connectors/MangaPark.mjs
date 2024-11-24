import MangaParkEN from './MangaParkEN.mjs';

export default class MangaPark extends MangaParkEN {

    constructor() {
        super();
        super.id = 'mangapark';
        super.label = 'MangaPark (by AnyACG)';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://mangapark.org';
        this.apiURL = `${this.url}/apo/`;

        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
    }
}

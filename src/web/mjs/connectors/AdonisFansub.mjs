import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AdonisFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'adonisfansub';
        super.label = 'Adonis Fansub';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://manga.adonisfansub.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
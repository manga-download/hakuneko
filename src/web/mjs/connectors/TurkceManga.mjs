import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TurkceManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'turkcemanga';
        super.label = 'Turkce Manga';
        this.tags = [ 'manga', 'webtoon' ,'turkish' ];
        this.url = 'https://www.turkcemanga.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryMangas = 'div.post-title h3 a:not([target]), div.post-title h5 a:not([target])';
    }
}
import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PijamaliKoi extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'pijamalikoi';
        super.label = 'Pijamalı Koi';
        this.tags = [ 'manga', 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://pijamalikoi.com';
        this.path = '/m/manga/list-mode/';
    }
}
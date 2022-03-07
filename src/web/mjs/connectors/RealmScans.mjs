import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RealmScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'realmscans';
        super.label = 'RealmScans';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://realmscans.com';
        this.path = '/series/?list';
    }
}
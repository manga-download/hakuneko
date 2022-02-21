import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RealmScansArabic extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'realmscansarabic';
        super.label = 'RealmScans Arabic';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://ar.realmscans.com';
        this.path = '/series/?list';
    }
}
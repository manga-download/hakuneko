import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AnitationArts extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'anitationarts';
        super.label = 'Anitation Arts';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://anitationarts.org';
        this.path = '/manga/?list';
    }
}
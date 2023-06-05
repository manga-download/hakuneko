import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class ManhwaList extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwalist';
        super.label = 'Manhwa List';
        this.tags = [ 'manga', 'indonesian'];
        this.url = 'https://manhwalist.xyz';
        this.path = '/manga/?list';
    }
}

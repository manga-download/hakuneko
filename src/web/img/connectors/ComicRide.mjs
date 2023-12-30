import YoungChampion from './YoungChampion.mjs';

//ComiciViewer
export default class ComicRide extends YoungChampion {
    constructor() {
        super();
        super.id = 'comicride';
        super.label = 'ComicRide';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://comicride.jp';
        this.apiUrl = this.url;
        this.links = {
            login: 'https://comicride.jp/signin'
        };
    }
}
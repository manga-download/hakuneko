import YoungChampion from './YoungChampion.mjs';

//ComiciViewer
export default class BigComics extends YoungChampion {
    constructor() {
        super();
        super.id = 'bigcomics';
        super.label = 'BigComics';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://bigcomics.jp';
        this.apiUrl = this.url;
        this.links = {
            login: 'https://bigcomics.jp/signin'
        };
    }
}
import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class SweetTimeScan extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'sweettimescan';
        super.label = 'Sweet Time Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://sweetscan.net';
    }
}
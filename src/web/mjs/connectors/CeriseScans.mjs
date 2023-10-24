import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class CeriseScans extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'cerisescans';
        super.label = 'Cerise Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://cerisescan.com';
    }
}

import Genkan from './templates/Genkan.mjs';

export default class KKJScans extends Genkan {

    constructor() {
        super();
        super.id = 'kkjscans';
        super.label = 'KKJ Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://kkjscans.co';
    }
}
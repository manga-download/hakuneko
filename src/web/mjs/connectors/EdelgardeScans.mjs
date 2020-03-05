import Genkan from './templates/Genkan.mjs';

export default class EdelgardeScans extends Genkan {

    constructor() {
        super();
        super.id = 'edelgardescans';
        super.label = 'Edelgarde Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://edelgardescans.com';
    }
}
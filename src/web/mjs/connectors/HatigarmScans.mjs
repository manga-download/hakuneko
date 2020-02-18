import Genkan from './templates/Genkan.mjs';

export default class HatigarmScans extends Genkan {

    constructor() {
        super();
        super.id = 'hatigarmscans';
        super.label = 'Hatigarm Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://hatigarmscanz.net';
    }
}
import Genkan from './templates/Genkan.mjs';

export default class LynxScans extends Genkan {

    constructor() {
        super();
        super.id = 'secretscans';
        super.label = 'Lynx Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://lynxscans.com';
        this.links = {
            login: 'https://lynxscans.com/login'
        };
        this.path = '/web/comics';
    }
}
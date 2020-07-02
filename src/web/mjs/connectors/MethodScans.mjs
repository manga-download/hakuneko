import Genkan from './templates/Genkan.mjs';

export default class MethodScans extends Genkan {

    constructor() {
        super();
        super.id = 'methodscans';
        super.label = 'Method Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://methodscans.com';
    }
}
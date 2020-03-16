import Genkan from './templates/Genkan.mjs';

export default class SecretScans extends Genkan {

    constructor() {
        super();
        super.id = 'secretscans';
        super.label = 'Secret Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://secretscans.co';
    }
}
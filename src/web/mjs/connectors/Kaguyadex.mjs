import Genkan from './templates/Genkan.mjs';

/**
 *
 */
export default class Kaguyadex extends Genkan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kaguyadex';
        super.label = 'Kaguyadex';
        this.tags = [ 'manga', 'english', 'high-quality' ];
        this.url = 'https://kaguyadex.com';
    }
}
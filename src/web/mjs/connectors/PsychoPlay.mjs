import Genkan from './templates/Genkan.mjs';
//dead?
/**
 *
 */
export default class PsychoPlay extends Genkan {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'psychoplay';
        super.label = 'PsychoPlay';
        this.tags = [ 'manga', 'english', 'high-quality', 'scanlation' ];
        this.url = 'https://psychoplay.co';
    }
}
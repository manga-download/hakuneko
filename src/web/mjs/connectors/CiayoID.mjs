import Ciayo from './templates/Ciayo.mjs';

/**
 *
 */
export default class CiayoID extends Ciayo {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ciayoid';
        super.label = 'CIAYO-ID';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://www.ciayo.com/id'; // URL for copy/paste detection

        this.language = 'id';
    }
}
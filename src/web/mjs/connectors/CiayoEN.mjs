import Ciayo from './templates/Ciayo.mjs';

/**
 *
 */
export default class CiayoEN extends Ciayo {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ciayoen';
        super.label = 'CIAYO-EN';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.ciayo.com/en'; // URL for copy/paste detection

        this.language = 'en';
    }
}
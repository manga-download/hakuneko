import WordPressLightPro from './templates/WordPressLightPro.mjs';

/**
 *
 */
export default class Authrone extends WordPressLightPro {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'authrone';
        super.label = 'Authrone';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.authrone.com';
    }
}
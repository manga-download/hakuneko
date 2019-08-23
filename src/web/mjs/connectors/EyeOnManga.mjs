import WordPressLightPro from './templates/WordPressLightPro.mjs';

/**
 *
 */
export default class EyeOnManga extends WordPressLightPro {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'eyeonmanga';
        super.label = 'EyeOnManga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.eyeonmanga.com';
    }
}
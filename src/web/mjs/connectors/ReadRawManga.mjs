import SoraOne from './templates/SoraOne.mjs';

export default class ReadRawManga extends SoraOne {

    constructor() {
        super();
        super.id = 'readrawmanga';
        super.label = 'ReadRawManga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.readrawmanga.com';
    }
}
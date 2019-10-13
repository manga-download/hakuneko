import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReadRawManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'readrawmanga';
        super.label = 'ReadRawManga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.readrawmanga.com';
    }
}
import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AHStudios extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ahstudios';
        super.label = 'A.H Studio';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://ahstudios.net';
    }
}
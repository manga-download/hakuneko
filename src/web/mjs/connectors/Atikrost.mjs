import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Atikrost extends WordPressMadara {
    constructor() {
        super();
        super.id = 'atikrost';
        super.label = 'Atikrost';
        this.tags = [ 'manga', 'high-quality', 'turkish' ];
        this.url = 'https://atikrost.com';
        this.language = 'tr';
    }
}
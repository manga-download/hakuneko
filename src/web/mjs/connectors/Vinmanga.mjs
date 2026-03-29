import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Vinmanga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'vinmanga';
        super.label = 'Vinmanga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://vinload.com';
    }
}
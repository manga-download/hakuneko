import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Bokugents extends WordPressMadara {
    constructor() {
        super();
        super.id = 'bokugents';
        super.label = 'Bokugen Translations';
        this.tags = [ 'webtoon', 'spanish', 'manga', 'scanlation' ];
        this.url = 'https://bokugents.com';
    }
}
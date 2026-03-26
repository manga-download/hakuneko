import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GeceninLordu extends WordPressMadara {

    constructor() {
        super();
        super.id = 'geceninlordu';
        super.label = 'Gecenin Lordu';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://geceninlordu.com';
    }
}
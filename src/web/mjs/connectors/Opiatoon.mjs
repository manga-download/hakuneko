import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Opiatoon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'opiatoon';
        super.label = 'Opiatoon (Opia&Shipperland)';
        this.tags = [ 'manga', 'turkish', 'webtoon' ];
        this.url = 'https://www.opiatoon.com';
    }
}
import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TortugaCeviri extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tortugaceviri';
        super.label = 'Tortuga Çeviri';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://tortuga-ceviri.com';
    }
}
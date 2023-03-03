import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FayScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'fayscans';
        super.label = 'Fay Scans';
        this.tags = [ 'manga', 'portuguese', 'scanlation' ];
        this.url = 'https://fayscans.com.br';
    }
}
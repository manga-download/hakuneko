import WordPressMadara from './templates/WordPressMadara.mjs';

export default class EinherjarScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'einherjarscans';
        super.label = 'Einherjar Scans';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://einherjarscans.space';
    }
}
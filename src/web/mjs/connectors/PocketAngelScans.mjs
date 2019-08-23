import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class PocketAngelScans extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'pocketangelscans';
        super.label = 'Pocket Angel Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://pocketangelscans.com';
    }
}
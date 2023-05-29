import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KaratcamScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'karatcamscans';
        super.label = 'Karatcam Scans';
        this.tags = [ 'manga', 'french', 'scanlation' ];
        this.url = 'https://karatcam-scans.fr';
    }
}
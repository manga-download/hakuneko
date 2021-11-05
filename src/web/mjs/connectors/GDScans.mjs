import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GDScans extends WordPressMadara {
    constructor() {
        super();
        super.id = 'gdscans';
        super.label = 'GD Scans';
        this.tags = [ 'manga', 'scanlation', 'english' ];
        this.url = 'https://gdscan.xyz';
    }
}
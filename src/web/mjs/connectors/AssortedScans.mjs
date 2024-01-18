import MangAdventure from './templates/MangAdventure.mjs';

export default class AssortedScans extends MangAdventure {
    constructor() {
        super();
        super.id = 'assortedscans';
        super.label = 'Assorted Scans';
        this.tags = ['manga', 'english'];
        this.url = 'https://assortedscans.com';
    }
}

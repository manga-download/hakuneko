import HeanCMS from './templates/HeanCMS.mjs';

export default class LyraScans extends HeanCMS {

    constructor() {
        super();
        super.id = 'lyrascans';
        super.label = 'Quantum Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://quantumscans.org';
        this.api = 'https://api.quantumscans.org';
    }
}

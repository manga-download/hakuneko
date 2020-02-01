import Genkan from './templates/Genkan.mjs';

export default class ReaperScans extends Genkan {

    constructor() {
        super();
        super.id = 'reaperscans';
        super.label = 'Reaper Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://reaperscans.com';
    }
}
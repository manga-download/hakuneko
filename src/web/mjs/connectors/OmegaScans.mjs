import HeanCms from './templates/HeanCms.mjs';

export default class OmegaScans extends HeanCms {
    constructor() {
        super();
        super.id = 'omegascans';
        super.label = 'OmegaScans';
        this.tags = [ 'webtoon', 'scanlation', 'english', 'hentai'];
        this.url = 'https://omegascans.org';
        this.api = 'https://api.omegascans.org';
        this.links = {
            login: 'https://omegascans.org/login'
        };
    }
}

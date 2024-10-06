import Iken from './templates/Iken.mjs';

export default class Vortex_Scans extends Iken {
    constructor() {
        super();
        super.id = 'vortex_scans';
        super.label = 'Vortex_Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://vortexscans.org';
        this.api = 'https://vortexscans.org';
        this.links = {
            login: 'https://vortexscans.org/auth/signin',
        };
    }
}
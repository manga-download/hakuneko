import Iken from './templates/Iken.mjs';

export default class VortexScans extends Iken {
    constructor() {
        super();
        super.id = 'vortexscans';
        super.label = 'VortexScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://vortexscans.org';
        this.links = {
            login: 'https://vortexscans.org/auth/signin',
        };
    }
}
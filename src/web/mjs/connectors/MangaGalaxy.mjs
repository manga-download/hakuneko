import Iken from './templates/Iken.mjs';

export default class MangaGalaxy extends Iken {
    constructor() {
        super();
        super.id = 'mangagalaxy';
        super.label = 'MangaGalaxy';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://mangagalaxy.net';
        this.links = {
            login: 'https://mangagalaxy.net/auth/signin',
        };
    }
}
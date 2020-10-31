import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HikariScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hikariscan';
        super.label = 'Hikari Scan';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://hikariscan.com.br';
    }
}
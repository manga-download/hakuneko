import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class GodsRealmScan extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'godsrealmscan';
        super.label = 'God\'s Realm Scan';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://godsrealmscan.com';
    }
}
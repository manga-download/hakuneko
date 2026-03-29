import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AtmSubs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'atmsubs';
        super.label = 'ATM Subs';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://atm-subs.fr';
    }
}
import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Funbe extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'funbe';
        super.label = 'Funbe';
        this.tags = [ 'webtoon', 'hentai', 'korean' ];
        this.url = 'https://funbe.me';

        this._initializeTwitterURL('1087681227832754182');
    }
}
import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Toonkor extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'toonkor';
        super.label = 'Toonkor';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://tkor.pro';

        this._initializeTwitterURL('1202224761771741184');
    }
}
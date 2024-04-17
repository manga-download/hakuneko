import YoungChampion from './YoungChampion.mjs';

export default class MagKan extends YoungChampion {

    constructor() {
        super();
        super.id = 'magkan';
        super.label = 'MagKan';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://kansai.mag-garden.co.jp';
    }
}

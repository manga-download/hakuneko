import YoungChampion from './YoungChampion.mjs';

export default class COMICMeDu extends YoungChampion {

    constructor() {
        super();
        super.id = 'comicmedu';
        super.label = 'COMIC MeDu (こみっくめづ)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-medu.com';
        this.links = {
            login: 'https://comic-medu.com/signin'
        };
    }
}

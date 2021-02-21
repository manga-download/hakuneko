import FoolSlide from './templates/FoolSlide.mjs';

export default class SeinagiAdultoFansub extends FoolSlide {

    constructor() {
        super();
        super.id = 'seinagiadultofansub';
        super.label = 'SeinagiAdultoFansub';
        this.tags = [ 'hentai', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://adulto.seinagi.org.es';
        this.links = {
            login: 'https://adulto.seinagi.org.es/account/auth/login/'
        };
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}
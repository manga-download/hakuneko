import WordPressClarityMangaReader from './templates/WordPressClarityMangaReader.mjs';

export default class PlotTwistNoFansub extends WordPressClarityMangaReader {

    constructor() {
        super();
        super.id = 'plottwistnofansub';
        super.label = 'Plot Twist No Fansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.plot-twistnf-scans.com';
        this.links = {
            login: 'https://www.plot-twistnf-scans.com/wp-login.php'
        };

        this.paths = [ '/proyectos-finalizados-new/', '/proyectos-activosss/' ];
        this.queryMangas = 'div.vc_gitem-zone a.vc_gitem-link';
    }
}
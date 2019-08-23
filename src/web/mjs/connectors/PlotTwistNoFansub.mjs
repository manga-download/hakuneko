import WordPressClarityMangaReader from './templates/WordPressClarityMangaReader.mjs';

/**
 *
 */
export default class PlotTwistNoFansub extends WordPressClarityMangaReader {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'plottwistnofansub';
        super.label = 'Plot Twist No Fansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.plot-twistnf-scans.com';

        this.paths = [ '/proyectos-finalizados/', '/proyectos-activos/' ];
    }
}
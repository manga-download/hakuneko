import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PlotTwistScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'plottwistscan';
        super.label = 'Plot Twist Scan';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.plotwistscan.com';

        this.queryChapters = 'li.wp-manga-chapter a';
    }
}
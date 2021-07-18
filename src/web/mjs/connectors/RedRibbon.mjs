import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RedRibbon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'redribbon';
        super.label = 'Red Ribbon';
        this.tags = [ 'manga', 'portuguese', 'scanlation' ];
        this.url = 'https://redribbon.site';
    }
}

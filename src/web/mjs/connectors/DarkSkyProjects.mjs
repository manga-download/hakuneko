import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class DarkSkyProjects extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'darkskyprojects';
        super.label = 'DarkSky Projects';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://darkskyprojects.org';
    }
}
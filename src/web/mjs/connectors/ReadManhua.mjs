import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class ReadManhua extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'readmanhua';
        super.label = 'ReadManhua';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://readmanhua.net';
    }
}
import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaLover extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangalover';
        super.label = '3asq (مانجا العاشق)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://3asq.org';
    }
}
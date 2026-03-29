import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AllPornComic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'allporncomic';
        super.label = 'AllPornComic';
        this.tags = [ 'hentai', 'porn', 'english' ];
        this.url = 'https://allporncomic.com';
    }
}
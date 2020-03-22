import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TrashScanlations extends WordPressMadara {

    constructor() {
        super();
        super.id = 'trashscanlations';
        super.label = 'TrashScanlations';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://trashscanlations.com';
    }
}
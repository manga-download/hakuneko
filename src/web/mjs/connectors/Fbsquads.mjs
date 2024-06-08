import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Fbsquads extends WordPressMadara {
    constructor() {
        super();
        super.id = 'fbsquads';
        super.label = 'Fleur Blanche Squads';
        this.tags = [ 'webtoon', 'spanish', 'scanlation', 'yaoi' ];
        this.url = 'https://fbsscan.com';
    }
}

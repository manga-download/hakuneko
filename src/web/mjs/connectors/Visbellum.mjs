import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Visbellum extends WordPressMadara {

    constructor() {
        super();
        super.id = 'visbellum';
        super.label = 'Visbellum';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://visbellum.com';
    }
}
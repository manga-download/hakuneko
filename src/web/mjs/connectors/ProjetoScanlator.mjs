import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ProjetoScanlator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'projetoscanlator';
        super.label = 'Projeto Scanlator';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://projetoscanlator.com';
    }
}
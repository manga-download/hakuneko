import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AlianzaMarcial extends WordPressMadara {

    constructor() {
        super();
        super.id = 'alianzamarcial';
        super.label = 'AlianzaMarcial';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://www.alianzamarcial.xyz';
    }
}
import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TraduccionesAmistosas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'traduccionesamistosas';
        super.label = 'Traducciones Amistosas';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://scantraduccionesamistosas.xyz';
    }
}
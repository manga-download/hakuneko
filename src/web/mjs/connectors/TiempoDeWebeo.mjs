import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TiempoDeWebeo extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tiempodewebeo';
        super.label = 'Tiempo de Webeo';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://tiempodewebeo.com';
    }
}
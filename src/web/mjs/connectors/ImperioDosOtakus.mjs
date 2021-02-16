import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ImperioDosOtakus extends WordPressMadara {

    constructor() {
        super();
        super.id = 'imperiodosotakus';
        super.label = 'Imperio dos Otakus';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://imperiodosotakus.tk';
    }
}
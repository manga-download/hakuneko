import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TeabeerComics extends WordPressMadara {

    constructor() {
        super();
        super.id = 'teabeercomics';
        super.label = 'Teabeer Comics';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://teabeercomics.com';
    }
}
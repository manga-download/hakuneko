import WordPressMadara from './templates/WordPressMadara.mjs';

export default class IndianComicsOnline extends WordPressMadara {

    constructor() {
        super();
        super.id = 'indiancomicsonline';
        super.label = 'Indian Comics Online';
        this.tags = [ 'comic', 'hindi' ];
        this.url = 'https://www.indiancomicsonline.com';
    }
}
import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PornComixOnline extends WordPressMadara {

    constructor() {
        super();
        super.id = 'porncomixonline';
        super.label = 'PornComix';
        this.tags = [ 'porn', 'english' ];
        this.url = 'https://www.porncomixonline.net';
    }
}
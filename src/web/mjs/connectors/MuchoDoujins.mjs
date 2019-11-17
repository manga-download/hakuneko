import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MuchoDoujins extends WordPressMadara {

    constructor() {
        super();
        super.id = 'muchodoujins';
        super.label = 'MuchoDoujins';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://muchodoujins.com';
    }
}
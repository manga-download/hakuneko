import WordPressMadara from './templates/WordPressMadara.mjs';
//dead?
export default class OlaoeManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'olaoemanga';
        super.label = 'مانجا اونلاين (Olaoe Manga)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://olaoe.giize.com';
    }
}
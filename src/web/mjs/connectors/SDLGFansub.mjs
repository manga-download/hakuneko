import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SDLGFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sdlgfansub';
        super.label = 'SDLG Fansub';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'https://www.sdlg-fansub.tk';
    }
}
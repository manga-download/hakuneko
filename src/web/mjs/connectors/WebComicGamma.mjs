import TakeShoboNew from './templates/TakeShoboNew.mjs';

export default class WebComicGamma extends TakeShoboNew {

    constructor() {
        super();
        super.id = 'webcomicgamma';
        super.label = 'WebComicGamma';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://webcomicgamma.takeshobo.co.jp';
    }
}
import TakeShobo from './templates/TakeShobo.mjs';

/**
 *
 */
export default class WebComicGamma extends TakeShobo {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'webcomicgamma';
        super.label = 'WebComicGamma';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://webcomicgamma.takeshobo.co.jp';
    }
}
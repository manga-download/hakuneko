import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LazyBoysScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'lazyboysscan';
        super.label = 'Lazy Boys';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'https://lazyboysscan.com';
    }
}
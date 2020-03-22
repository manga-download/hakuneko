import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MilfToon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'milftoon';
        super.label = 'Milftoon Comics';
        this.tags = [ 'porn', 'english' ];
        this.url = 'https://milftoon.xxx';
    }
}
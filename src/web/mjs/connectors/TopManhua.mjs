import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TopManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'topmanhua';
        super.label = 'ManhuaTop';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuatop.org';
    }
}

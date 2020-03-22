import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NovelFrance extends WordPressMadara {

    constructor() {
        super();
        super.id = 'novelfrance';
        super.label = 'Novel France';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'http://novel-france.fr';
    }
}
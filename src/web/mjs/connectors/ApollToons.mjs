import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ApollToons extends WordPressMadara {

    constructor() {
        super();
        super.id = 'apolltoons';
        super.label = 'Apolltoons';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://apolltoons.xyz';
    }
}
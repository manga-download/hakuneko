import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ApollComics extends WordPressMadara {

    constructor() {
        super();
        super.id = 'apollcomics';
        super.label = 'Apoll Comics';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://apollcomics.xyz';
    }
}
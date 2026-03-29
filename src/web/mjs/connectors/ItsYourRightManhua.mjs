import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ItsYourRightManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'itsyourightmanhua';
        super.label = 'Its Your Right Manhua';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://itsyourightmanhua.com';
    }
}
import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaSpark extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaspark';
        super.label = 'مانجا سبارك (Manga Spark)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://mangaspark.com';
    }
}
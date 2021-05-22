import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PrismaScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'prismascans';
        super.label = 'Prisma Scan';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://prismascans.net';
    }
}

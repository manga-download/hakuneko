import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PrismaHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'prismahentai';
        super.label = 'Prisma Hentai';
        this.tags = [ 'hentai', 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://prismahentai.com';
    }
}

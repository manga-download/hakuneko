import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansID extends WordPressMadara {
    constructor() {
        super();
        super.id = 'reaperscansid';
        super.label = 'Shinigami ID';
        this.tags = ['webtoon', 'indonesian', 'scanlation'];
        this.url = 'https://shinigami.sh';
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat ='span.chapter-release-date';
        this.queryPages = 'div.page-break source[data-src]';
        this.links = {
            login: 'https://shinigami.sh/login'
        };
    }
}

import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansID extends WordPressMadara {
    constructor() {
        super();
        super.id = 'reaperscansid';
        super.label = 'Shinigami ID';
        this.tags = ['webtoon', 'indonesian', 'scanlation'];
        this.url = 'https://shinigami.ae';
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat ='span.chapter-release-date';

        this.links = {
            login: 'https://shinigami.ae/login'
        };
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).filter(picture => {
            const pic= JSON.parse(atob(new URL(picture).searchParams.get('payload')));
            return pic.url.match(/WP-Manga/i);
        });
    }
}

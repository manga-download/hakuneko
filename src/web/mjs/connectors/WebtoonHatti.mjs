import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebtoonHatti extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoonhatti';
        super.label = 'Webtoon Hatti';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://webtoonhatti.net';
    }

    async _getPages(chapter) {
        const excludes = [
            /tr2.png$/i,
            /b2.jpg$/i,
            /romantiktr\.tr/i
        ];
        const images = await super._getPages(chapter);
        return images.filter(picture => {
            const pic= JSON.parse(atob(new URL(picture).searchParams.get('payload')));
            return !excludes.some(rgx => rgx.test(pic.url));
        });
    }
}

import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AsuraScansTR extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'asurascans-tr';
        super.label = 'Asura Scans (TR)';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://asurascanstr.com';
        this.path = '/manga/list-mode/';
        this.queryPages = 'div#readerarea p img';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
    }

    get icon() {
        return '/img/connectors/asurascans';
    }

    async _getPages(chapter) {
        const excludes = [
            /panda_gif_large/i,
            /2021\/04\/page100-10\.jpg/i,
            /2021\/03\/20-ending-page-\.jpg/i,
            /ENDING-PAGE/i
        ];
        const images = await super._getPages(chapter);
        return images.filter(link => !excludes.some(rgx => rgx.test(link)));
    }

}
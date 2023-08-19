import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AsuraScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'asurascans';
        super.label = 'Asura Scans';
        this.tags = ['webtoon', 'english'];
        this.path = '/manga/list-mode/';
        this.queryPages = 'div#readerarea p img';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        this.config = {
            url: {
                label: 'URL',
                description: `This website change domains regularly.\nThis is the default URL which can also be manually set by the user.`,
                input: 'text',
                value: 'https://asura.nacm.xyz'
            }
        };
    }

    get url() {
        return this.config.url.value;
    }

    set url(value) {
        if (this.config && value) {
            this.config.url.value = value;
            Engine.Settings.save();
        }
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

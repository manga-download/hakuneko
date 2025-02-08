import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ErosScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'erosscans';
        super.label = 'Eros Scan';
        this.tags = ['webtoon', 'english'];
        this.path = '/manga/list-mode/';
        this.config = {
            url: {
                label: 'URL',
                description: 'This website changes their URL regularly.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://doomcomic.xyz'
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
}

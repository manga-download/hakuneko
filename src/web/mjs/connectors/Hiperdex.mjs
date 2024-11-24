import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Hiperdex extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hiperdex';
        super.label = 'Hiperdex';
        this.tags = [ 'hentai', 'webtoon', 'english' ];
        this.config = {
            url: {
                label: 'URL',
                description: 'This website changes their URL regularly.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://hiperdex.xyz'
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

    canHandleURI(uri) {
        return this.url.includes(uri.hostname);
    }

}

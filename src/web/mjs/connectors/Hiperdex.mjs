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
                description: 'This website changes between those two URL regularly.\n Please select the one to use',
                input: 'select',
                options: [
                    { value: 'https://1sthiperdex.com', name: '1sthiperdex.com' },
                    { value: 'https://hiperdex.com', name: 'hiperdex.com' },
                ],
                value: 'https://1sthiperdex.com'

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

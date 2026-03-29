import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class NetTruyen extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'nettruyen';
        super.label = 'NetTruyen';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.config = {
            url: {
                label: 'URL',
                description: 'This website changes their URL regularly.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://www.nettruyenus.com'
            }
        };
        this.links = {
            login: this.url + '/Secure/Login.aspx'
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

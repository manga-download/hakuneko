import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class CopyToon extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'copytoon';
        super.label = 'CopyToon';
        this.tags = ['webtoon', 'korean'];

        this.path = ['/웹툰', '/포토툰'];
        this.scriptPages = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#bo_v_con img')].map(img => img.src));
            });
        `;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            url: {
                label: 'URL',
                description: 'This website changes their URL regularly.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://copytoon142.com/'
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
        return /https:\/\/copytoon\d+.com/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.contents-list ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: [...element.querySelector('div.content-title').childNodes].pop().textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }
}
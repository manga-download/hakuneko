import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Toonkor extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'toonkor';
        super.label = 'Toonkor';
        this.tags = ['webtoon', 'korean'];
        this.url = 'https://t.me/s/new_toonkor';
        this.hostRegexp = /https?:\/\/(?:toonkor|tkor)([\d]+)?\.[a-z]+/;
    }

    canHandleURI(uri) {
        return this.hostRegexp.test(uri.origin);
    }

    async _initializeConnector() {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                	  //fetch telegram messages with links, reverse it because last one is more recent one, and get the first matching our regex
                    const tkLinks = [...document.querySelectorAll('section.tgme_channel_history div.tgme_widget_message_wrap .tgme_widget_message_text a ')].reverse();
                    for (const link of tkLinks) {
                        if ( ${this.hostRegexp}.test(link.href)) {
                            resolve(link.href);
                            break;
                        }
                    }
                },1500);
            });
        `;
        const uri = new URL(this.url);
        const request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, script);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }
}

import Connector from '../../engine/Connector.mjs';

export default class Crunchyroll extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = 'https://www.crunchyroll.com';
        this.apiURL = 'https://api-manga.crunchyroll.com';
        /*
         * this.subscriptionID = 'manga';
         * this.subscription = false;
         * this.session = undefined;
         * this.token = undefined;
         */

        this.config = {
            username: {
                label: 'Username',
                description: 'Username for login with Crunchyroll premium account.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with Crunchyroll premium account.\n\nDisclaimer: HakuNeko may drop Crunchyroll support at any time.',
                input: 'password',
                value: ''
            }
        };
    }

    async _getMangas() {
        return [];
    }

    async _getChapters(manga) {
        return [];
    }

    async _getPages(chapter) {
        return [];
    }

    async _handleConnectorURI(payload) {
        return undefined;
    }
}
import Crunchyroll from './templates/Crunchyroll.mjs';

export default class CrunchyManga extends Crunchyroll {

    constructor() {
        super();
        super.id = 'crunchymanga';
        super.label = 'Crunchyroll* (Manga)';
        this.tags = [ 'manga', 'high-quality', 'multi-lingual' ];
        this.apiURL = 'https://api-manga.crunchyroll.com';
    }

    async _getMangas() {
        await this._login();
        let uri = this._createURI(this.apiURL, '/series');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.map(manga => {
            return {
                id: manga.series_id,
                title:  manga.locale && manga.locale.enUS ? manga.locale.enUS.name : manga.url.replace(/^\// , '')
            };
        });
    }

    async _getChapters(manga) {
        await this._login();
        if(!this._subscriptions.includes('manga')) {
            throw new Error('A premium subscription is required to download chapters with HakuNeko!');
        }
        let uri = this._createURI(this.apiURL, '/chapters');
        uri.searchParams.set('series_id', manga.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.chapters.reverse().map(chapter => {
            // chapter.volume_number
            let title = chapter.locale ? (chapter.locale[this.config.locale.value] || chapter.locale.enUS || '') : '';
            title = title ? ' - ' + title.name : '';
            return {
                id: chapter.chapter_id,
                title: chapter.number.padStart(7, '0') + title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        await this._login();
        let uri = this._createURI(this.apiURL, '/list_chapter');
        uri.searchParams.set('chapter_id', chapter.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.pages.map(page => {
            /*
             *let uri = new URL( page['image_url'] ); // sometimes invalid
             *let uri = new URL( page.locale.enUS['image_url'] ); // this seems to be the raw image (png), but access is forbidden
             *let uri = new URL( page.locale.enUS['composed_image_url'] ); // access is forbidden
             *let uri = new URL( page.locale.enUS['encrypted_mobile_image_url'] ); // smaller size
             */
            let link;
            try {
                let source = page.locale[this.config.locale.value] || page.locale.enUS;
                link = source['encrypted_composed_image_url'] || source['encrypted_mobile_image_url'];
            } catch(error) {
                link = page['image_url'];
            }
            return this.createConnectorURI(link);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let response = await fetch(request);
        let data = await response.arrayBuffer();
        return {
            mimeType: response.headers.get('content-type'),
            data: this._decryptImage(data, 0x42)
        };
    }

    _decryptImage(encrypted, key) {
        // create a view for the buffer
        let decrypted = new Uint8Array(encrypted);
        for(let index in decrypted) {
            decrypted[index] ^= key;
        }
        return decrypted;
    }
}
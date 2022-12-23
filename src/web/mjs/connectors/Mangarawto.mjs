import Manga9 from './Manga9.mjs';

export default class Mangarawto extends Manga9 {

    constructor() {
        super();
        super.id = 'mangarawto';
        super.label = 'Manga Raw (mangaraw.to)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://mangaraw.to';
    }

    canHandleURI(uri) {
        return /^mangaraw\.(to|vip|io)$/.test(uri.hostname);
    }
}
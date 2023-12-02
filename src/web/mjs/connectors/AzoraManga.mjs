import Connector from '../engine/Connector.mjs';

export default class AzoraManga extends Connector {

    constructor() {
        super();
        super.id = 'azoramanga';
        super.label = 'أزورا مانج (AZORA MANGA)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://azoramanga.com';
    }

    async _getMangas() {
        throw new Error('Please use AzoraWorld connector instead.');
    }

    async _getChapters() {
        throw new Error('Please use AzoraWorld connector instead.');
    }

    async _getPages() {
        throw new Error('Please use AzoraWorld connector instead.');
    }

}
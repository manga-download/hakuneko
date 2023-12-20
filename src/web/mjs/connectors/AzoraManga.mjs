import AzoraWorld from './AzoraWorld.mjs';

export default class AzoraManga extends AzoraWorld {

    constructor() {
        super();
        super.id = 'azoramanga';
        super.label = 'أزورا مانج (AZORA MANGA)';
        this.tags = [ 'webtoon', 'arabic' ];
    }
}

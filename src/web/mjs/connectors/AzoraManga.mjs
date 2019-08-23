import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class AzoraManga extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'azoramanga';
        super.label = 'أزورا مانج (AZORA MANGA)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://www.azoramanga.com';
    }
}
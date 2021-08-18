import AsuraScans from './AsuraScans.mjs';

export default class AsuraScansTR extends AsuraScans {

    constructor() {
        super();
        super.id = 'asurascans-tr';
        super.label = 'Asura Scans (TR)';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://tr.asurascans.com';
    }

    get icon() {
        return '/img/connectors/asurascans';
    }
}
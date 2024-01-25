import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AsuraScansTR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'asurascans-tr';
        super.label = 'Asura Scans (TR)';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://asurascans.com.tr';
    }

    get icon() {
        return '/img/connectors/asurascans';
    }
}

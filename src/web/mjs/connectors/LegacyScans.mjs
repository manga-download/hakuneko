import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LegacyScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'legacyscans';
        super.label = 'Legacy-Scans';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://legacy-scans.com';
    }
}

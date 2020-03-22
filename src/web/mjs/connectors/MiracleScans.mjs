import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MiracleScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'miraclescans';
        super.label = 'Miracle Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://miraclescans.com';
    }
}
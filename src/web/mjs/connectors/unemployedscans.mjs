import WordPressMadara from './templates/WordPressMadara.mjs';

export default class UnEmployedScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'unemployedscans';
        super.label = 'Unemployed Scans';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://unemployedscans.com';
    }
}

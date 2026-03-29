import WordPressMadara from './templates/WordPressMadara.mjs';
export default class InfraFandub extends WordPressMadara {
    constructor() {
        super();
        super.id = 'infrafandub';
        super.label = 'Infra Fandub';
        this.tags = [ 'webtoon', 'manga', 'spanish' ];
        this.url = 'https://infrafandub.xyz';
    }
}
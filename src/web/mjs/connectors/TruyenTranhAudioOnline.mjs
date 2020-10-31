import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TruyenTranhAudioOnline extends WordPressMadara {

    constructor() {
        super();
        super.id = 'truyentranhaudioonline';
        super.label = 'Truyện tranh audio';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://truyentranhaudio.online';

        this.queryPages = 'div.reading-content source';
    }
}
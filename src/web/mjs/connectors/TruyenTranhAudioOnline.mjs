import TruyenTranhAudio from './TruyenTranhAudio.mjs';

export default class TruyenTranhAudioOnline extends TruyenTranhAudio {

    constructor() {
        super();
        super.id = 'truyentranhaudioonline';
        super.label = 'Truyện Tranh Audio Online';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://truyentranhaudio.online'; // mirror of https://truyentranhaudio.com
    }
}
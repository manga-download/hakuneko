import CoreView from './templates/CoreView.mjs';

export default class ShonenJumpPlus extends CoreView {

    constructor() {
        super();
        super.id = 'shonenjumpplus';
        super.label = '少年ジャンプ＋ (Shonen Jump +)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://shonenjumpplus.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
    }
}

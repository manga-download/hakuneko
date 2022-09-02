import CoreView from './templates/CoreView.mjs';

export default class ShonenJumpPlus extends CoreView {

    constructor() {
        super();
        super.id = 'shonenjumpplus';
        super.label = '少年ジャンプ＋ (Shonen Jump +)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://shonenjumpplus.com';
    }

    async _getChapters(manga) {
        if(/^\/magazine\/\d+$/.test(manga.id)) {
            return [{
                id: manga.id,
                title: manga.title
            }];
        } else {
            return super._getChapters(manga);
        }
    }
}
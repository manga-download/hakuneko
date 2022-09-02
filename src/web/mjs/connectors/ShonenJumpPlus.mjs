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
            let request = new Request(new URL(this.url+manga.id), this.requestOptions);
            let data = await this.fetchDOM(request, '.episode-header-date');
            return [{
                id: manga.id,
                title: data[0].textContent.trim()
            }];
        } else {
            return super._getChapters(manga);
        }
    }
}
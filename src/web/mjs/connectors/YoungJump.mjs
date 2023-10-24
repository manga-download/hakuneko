import SpeedBinb from './templates/SpeedBinb.mjs';

export default class YoungJump extends SpeedBinb {

    constructor() {
        super();
        super.id = 'youngjump';
        super.label = 'ヤングジャンプ / ウルトラジャンプ (young jump/ultra jump)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.youngjump.world';
        this.links = {
            login: 'https://www.youngjump.world/?login=1'
        };
    }

    async _getMangas() {
        const request = new Request(`${this.url}/yj-rest-apis/getBookInfo.php`, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.map(magazine => {
            return {
                id: magazine.url,
                title : `${magazine.issue} - ${magazine.number}`
            };
        });

    }

    async _getChapters(manga) {
        return [{id: manga.id, title : manga.title}];
    }
}

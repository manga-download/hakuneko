import SpeedBinb from './templates/SpeedBinb.mjs';

export default class ComicZerosum extends SpeedBinb {

    constructor() {
        super();
        super.id = 'comiczerosum';
        super.label = 'Comic ゼロサム (Comic ZEROSUM)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://online.ichijinsha.co.jp/zerosum';
        this.data_url = 'https://online.ichijinsha.co.jp/json/zerosum';
    }

    async _getMangas() {
        const request = new Request(`${this.data_url}/list/name.json`, this.requestOptions);
        const data = await this.fetchJSON(request);

        return data.Stories.map(story => {
            return {
                id: story.Work.Tag,
                title: story.Work.Name
            }
        });
    }

    async _getChapters(manga) {
        const request = new Request(`${this.data_url}/works/${manga.id}.json`, this.requestOptions);
        const data = await this.fetchJSON(request);

        return data.Work.Stories.map(story => {
            return {
                id: story.Url,
                title: story.Name
            }
        });
    }
}
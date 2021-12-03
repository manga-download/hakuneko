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
        let mangaList = [];

        const request = new Request(this.data_url + '/list/name.json', this.requestOptions);
        const data = await this.fetchJSON(request);

        const stories = data.Stories;
        for (let story of stories) {
            let manga = {
                id: story.Work.Tag,
                title: story.Work.Name
            }
            mangaList.push(manga);
        }

        return mangaList;
    }

    async _getChapters(manga) {
        let chapters = [];

        const request = new Request(this.data_url + '/works/' + manga.id + '.json', this.requestOptions);
        const data = await this.fetchJSON(request);

        const stories = data.Work.Stories;
        for (let story of stories) {
            let chapter = {
                id: story.Url,
                title: story.Name
            }
            chapters.push(chapter);
        }
        return chapters;
    }
}
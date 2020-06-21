import SpeedBinb from './templates/SpeedBinb.mjs';

export default class YoungJump extends SpeedBinb {

    constructor() {
        super();
        super.id = 'youngjump';
        super.label = 'ヤングジャンプ / ウルトラジャンプ (young jump/ultra jump)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.youngjump.world';
    }

    async _getMangas() {
        return [
            {
                id: 'free_uj/',
                title: 'ウルトラジャンプ - ultra jump'
            },
            {
                id: 'free_yj/',
                title: 'ヤングジャンプ - young jump'
            }
        ];
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request);

        let chapters = [];
        for (const year of data.querySelectorAll('section.sp-w')) {
            const mangas = [...year.querySelectorAll('a.p-my__list-link')];
            chapters.push(...mangas.map(element => {
                return {
                    id: this.getAbsolutePath(element.href, this.url),
                    title: year.querySelector('h3').innerText.trim() +' - ' + element.querySelector('h4').innerText.trim()
                };
            }));
        }

        return chapters;
    }

}
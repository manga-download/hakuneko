import Connector from '../engine/Connector.mjs';

export default class ReadManga extends Connector {

    constructor() {
        super();
        super.id = 'readmanga';
        super.label = 'ReadManga';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://readmanga.live';

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests.\nSlightly increase the value when getting 429 errors during manga list update.',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 1500
            }
        };

        this.preferSubtitleAsMangaTitle = true;
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/list', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'span.pagination a:nth-last-child(2)');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            await this.wait(this.config.throttle.value);
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/list?offset=' + page * 70, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tile div.desc');
        return data.map( element => {
            let a = element.querySelector('h3 a');
            let h4 = element.querySelector('h4');
            return {
                id: this.getRootRelativeOrAbsoluteLink(a, this.url),
                title:  this.preferSubtitleAsMangaTitle && h4 ? h4.title : a.title
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#mangaBox' );
        let content = data[0];
        let mangaTitle = content.querySelector('h1.names span.name').innerText.trim();
        let chapterList = [...content.querySelectorAll('div.chapters-link table tr td a')];
        return chapterList.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/\s{1,}/g, ' ').replace(mangaTitle, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id + '?mtr=1', this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /init\s*\(\s*(\[\s*\[.*?\]\s*\])/g);
        return JSON.parse(data[0].replace(/'/g, '"')).map(page => page[0] + page[2]);
    }
}
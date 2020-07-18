import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class GoComics extends Connector {

    constructor() {
        super();
        super.id = 'gocomics';
        super.label = 'GoComics';
        this.tags = ['comic', 'english'];
        this.url = 'https://www.gocomics.com';
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may ban your IP for too many consecutive requests.',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 500
            }
        };
        this.lastChapter = '';
        this.getPagesCount = 0;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let comicData = await this.fetchDOM(request, 'nav.content-section-padded-sm ul a');
        let id = comicData[1].pathname.trim();
        let titleData;
        if (new RegExp(/\/\d\d\d\d\/\d?\d\/\d?\d$/).test(uri) == true) {
            titleData = await this.fetchDOM(request, 'a.gc-blended-link div.media.amu-media-item div.media-body h2');
        } else {
            titleData = await this.fetchDOM(request, 'a.gc-blended-link div.media.amu-media-item div.media-body h1');
        }
        let title = titleData[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/comics/a-to-z', this.requestOptions);
        let data = await this.fetchDOM(request, 'a.gc-blended-link.gc-blended-link--primary.col-12.col-sm-6.col-lg-4');
        return data.map(element => {
            let title = element.querySelector('div.media-body h4');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.innerText.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapter = manga.id;
        this.lastChapter = manga.id;
        let request = new Request(this.url + manga.id, this.requestOptions);
        let startData = await this.fetchDOM(request, 'nav.gc-calendar-nav a.fa-backward');
        let startDate = this._getDate(startData[0].pathname);
        let endDate = this._getDate(manga.id);
        let chapterList = [];
        let title = manga.id.slice(1, manga.id.search(/\/\d\d\d\d\/\d?\d\/\d?\d$/));
        let chapterNum = 1;
        for (let year = startDate.year; year <= endDate.year; year++) {
            for (let month = year == startDate.year ? startDate.month : 1; month <= 12; month++) {
                await this.wait(this.config.throttle.value);
                if (chapter != this.lastChapter) {
                    //since chapter lists take so long to load, if another chapter list starts getting loaded, it will stop the current one
                    return [];
                }
                let json = await (await fetch(this.url + '/calendar/' + title + '/' + year.toString() + '/' + month.toString())).json();
                if (json.length != 0) {
                    let newChapter = { id: '/' + year.toString() + '/' + month.toString(), title: 'Ch.' + chapterNum.toString().padStart(4, '0') + ' - ' + year.toString() + '/' + month.toString(), language: '' };
                    chapterList.push(newChapter);
                    chapterNum++;
                }
                if (year == endDate.year && month == endDate.month) {
                    break;
                }
            }
        }
        return chapterList;
    }

    _getDate(path) {
        let dateString = path.match(/\d\d\d\d\/\d?\d\/\d?\d$/)[0];
        return {
            year: parseInt(dateString.match(/\d\d\d\d/)[0]),
            month: parseInt(dateString.match(/\/\d?\d\//)[0].slice(1, -1))
        };
    }

    async _getPages(chapter) {
        this.getPagesCount++;
        let startPageCount = this.getPagesCount;
        let title = chapter.manga.id.slice(1, chapter.manga.id.search(/\/\d\d\d\d\/\d?\d\/\d?\d$/));
        let json = await (await fetch(this.url + '/calendar/' + title + chapter.id)).json();
        let pages = [];
        for (let date of json) {
            await this.wait(this.config.throttle.value);
            await this._waitFor(() => startPageCount == this.getPagesCount);
            let request = new Request(this.url + '/' + title + '/' + date, this.requestOptions);
            let imageData = await this.fetchDOM(request, 'div.comic__container div a picture source');
            let imageURL = imageData[0].src.trim();
            pages.push(imageURL);
        }
        this.getPagesCount--;
        return pages;
    }

    _waitFor(conditionFunction) {
        const poll = resolve => {
            if (conditionFunction()) resolve();
            else setTimeout(() => poll(resolve), 400);
        };
        return new Promise(poll);
    }
}
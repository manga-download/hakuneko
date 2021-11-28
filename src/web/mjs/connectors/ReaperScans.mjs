import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscans';
        super.label = 'Reaper Scans';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://reaperscans.com';
        this.links = {
            login: 'https://reaperscans.com/login'
        };
        this.queryChapters = 'li.wp-manga-chapter a';
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let dom = (await this.fetchDOM(request, 'body'))[0];
        let data = [...dom.querySelectorAll(this.queryChapters)];
        let placeholder = dom.querySelector('[id^="manga-chapters-holder"][data-id]');
        if (placeholder) {
            const promises = await Promise.allSettled([
                this._getChaptersAjax(manga.id),
                this._getChaptersAjaxOld(placeholder.dataset.id)
            ]);
            data = promises.find(promise => /fulfilled/i.test(promise.status)).value;
        }
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('p').innerText.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

}
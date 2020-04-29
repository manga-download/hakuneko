import SpeedBinb from './SpeedBinb.mjs';

export default class TakeShobo extends SpeedBinb {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
    }

    async _getMangas() {
        let request = new Request(new URL(this.url + '/'), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.lineup ul li a');
        return data.map(element => {
            let title = element.querySelector('source').getAttribute('alt');
            let match = title.match(/『(.*)』/);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: (match ? match[1] : title).trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.episode div.box_episode div.box_episode_text a:first-of-type');
        return data.map(element => {
            let title = element.parentElement.querySelector('div.episode_title');
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: title.innerText.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }
}
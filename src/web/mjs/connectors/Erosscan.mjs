import Connector from '../engine/Connector.mjs';

export default class Erosscans extends Connector {

    constructor() {
        super();
        super.id = 'erosscans';
        super.label = 'Eros Scan';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://erosxcomic.xyz/';
    }

    async _getMangas() {
		let request = new Request(this.url + '/manga/list-mode/', this.requestOptions);
		let data = await this.fetchDOM(request, '.series');
		return data.map(element => {
			return {
				id: this.getRootRelativeOrAbsoluteLink(element, this.url),
				title: element.textContent.trim()
			};
		});
	}

	

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
		let data = await this.fetchDOM(request, '#chapterlist a');
		return data.map(element => {
			return {
				id: this.getRootRelativeOrAbsoluteLink(element, this.url),
				title: element.querySelector('span.chapternum').textContent.trim(),
				language: ''
			};
		});
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);

		let data = await this.fetchRegex(request, /(https:\\\/\\\/erosscans.xyz\\\/wp-content\\\/[^\"]+)/g)
		data = data.map(link => link.replace(/\\/g, ''));
		console.log(data);
		return data.map(link => decodeURI(link));
    }
}
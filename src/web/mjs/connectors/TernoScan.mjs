import Connector from '../engine/Connector.mjs';

export default class Erosscans extends Connector {

    constructor() {
        super();
        super.id = 'ternoscan';
        super.label = 'Terno Scan';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://tenco-toons.xyz/';
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
		let scripts = await this.fetchDOM(request, "script");
		let reg = /(https:\\\/\\\/tecnocomic.xyz\\\/wp-content\\\/[^\"]+)/g;
		let data = [];
		for(const script of scripts){
			if(!script["src"].includes("data:text\/javascript\;base64,")) continue;
			let decoded = atob(script["src"].replace(/data:text\/javascript\;base64,/g, ""));
			console.log(decoded);
			data = [];
			let match = undefined;
			while(match = reg.exec(decoded)){
				data.push(match[1]);
			}
			console.log(data);
			if(data.length != 0) break;
		}
		return data;
    }
}
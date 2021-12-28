import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Baozimh extends Connector {

    constructor() {
        super();
        super.id = 'baozimh';
        super.label = '包子漫書 (baozimh)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.baozimh.com/';
    }
	
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
		const data = await this.fetchDOM(request, '.comics-detail__title'); //title object
        const id = uri.pathname;
		let title = data[0].textContent.trim()
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
		//where can it find the chapters
		const dom = await this.fetchDOM(request);
        let data = [...dom.querySelectorAll('.l-box #chapter-items > div > a'),...dom.querySelectorAll('.l-box #chapters_other_list > div > a')];
		let chapters = data.reverse(); //get first chapters on top
        return chapters.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
	async _getPages(chapter) {
        let pageLinks = [];
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
	    let data = await this.fetchDOM(request, '.comic-contain amp-img noscript');
		data = data.map(element => element.innerText.replace(/.*src="([^"]*)".*/, '$1'));
		return data;
    }
}
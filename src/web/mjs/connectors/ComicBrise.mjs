import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicBrise extends SpeedBinb {

    constructor() {
        super();
        super.id = 'comicbrise';
        super.label = 'comicBrise';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-brise.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.post-title');
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const msg = 'This website does not support mangas/chapters, please copy and paste the links containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
		const dom = await this.fetchDOM(request);
        const chaptersNames = dom.querySelectorAll('.modal.modal-chapter .modal-body .primary-title');
        const chaptersLink = dom.querySelectorAll('.modal.modal-chapter .modal-body .banner-trial a');
        const chaptersFree = dom.querySelectorAll('.modal.modal-chapter .modal-body .banner-trial source');
		let data = []; 
		for(let i = 0; i< chaptersNames.length; i++){
			let chapterNames = chaptersNames[i];
			let chapterLink = chaptersLink[i];
			let chapterFree = chaptersFree[i];
			if(chapterFree.getAttribute("alt")=="FREE"){
				data.push({
					id: this.getRootRelativeOrAbsoluteLink(chapterLink+"/", this.url),
					title: chapterNames.innerText.trim(),
				})
			}
		}
		return data;
    }
}
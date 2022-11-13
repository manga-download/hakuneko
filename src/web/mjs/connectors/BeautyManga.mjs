import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BeautyManga extends WordPressMadara {
	constructor() {
		super();
		super.id = 'beautymanga';
		super.label = 'BeautyManga';
		this.tags = [ 'manga', 'webtoon', 'english' ];
		this.url = 'https://mangadex.today';
		this.path = '/popular-manga';
		this.queryMangas = 'div.item-thumb.hover-details.c-image-hover a';
		this.queryMangasPageCount = 'ul.pagination li:nth-last-of-type(2) a';
		this.pathMangas = '?page=%PAGE%';
		this.queryPages = 'p#arraydata';
		this.mangaTitleFilter = '';
	}
	
	async _getMangasFromPage(page) {
		let uri = new URL(this.path + this.pathMangas.replace('%PAGE%', page), this.url);
		uri.pathname = uri.pathname.replace(/\/+/g, '/');
		let request = new Request(uri, this.requestOptions);
		let data = await this.fetchDOM(request, this.queryMangas);
		return data.map(element => {
			return {
				id: new URL(element.href, request.url).pathname,
				title: element.title.replace(this.mangaTitleFilter, '').trim()
			};
		});
	}
	
	async _getChaptersAjaxOld(mangaID) {
		const uri = new URL('/ajax-list-chapter?mangaID='+mangaID , this.url);
		const request = new Request(uri, {
			method: 'GET'
		});
		const data = await this.fetchDOM(request, this.queryChapters);
		if (data.length) {
			return data;
		}
		else {
			throw new Error('No chapters found (new ajax endpoint)!');
		}
	}
	
	async _getPages(chapter)
	{
		let uri = new URL(chapter.id, this.url);
		let request = new Request(uri, this.requestOptions);
		let data = await this.fetchDOM(request, this.queryPages);
		let el = data[0].innerText.split(',');
		return el.map(element =>
		{
			const uri = new URL(this.getAbsolutePath(element, request.url));
			return this.createConnectorURI({
				// HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
				url: uri.href.replace(/\/i\d+\.wp\.com/, ''),
				referer: uri.origin
			})
		});
	}
}

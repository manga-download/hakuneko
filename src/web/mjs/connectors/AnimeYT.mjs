import Connector from '../engine/Connetors.mjs';
import Manga from '../engine/Manga.mjs';
import PrettyFast from '../videostreams/PrettyFast.mjs';
import HydraX from '../videostreams/HidraX.mjs';

export default class AnimeYT extends Connector {
	constructor() {
		super();
		super.id = 'animeyt';
		super.label = 'AnimeYT';
		this.tags = ['anime', 'spanish'];
		this.url = 'https://animeyt2.tv';
		this.requestOptions.headers.set('x-requested-with', 'XMLHttpRequest');
	}

	async _getMangaFromURI(uri) {
		let request = new Request(uri, this.requestOptions);
		let response = await fetch(request);
		let data = await = response.text();
		let dom = this.createDom(data);
		let metaURL ?= dom.querySelector('meta[property="og:url"]').content.trim();
		let metaTitle = dom.querySelector('')
	}
}
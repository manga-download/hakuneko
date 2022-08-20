import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class YaoiHavenReborn extends Connector {

    constructor() {
        super();
        super.id = 'yaoihavenreborn';
        super.label = 'Yaoi Haven Reborn';
        this.tags = [ 'hentai', 'english', 'japanese' ];
        this.url = 'https://www.yaoihavenreborn.com';
        this.links = {
            login: 'https://www.yaoihavenreborn.com/accounts/login'
        };
    }

    async _getMangaFromURI(uri) {
        if(uri.pathname.startsWith('/doujinshi')) {
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchDOM(request, 'head meta[property="og:title"]', 3);
            const id = uri.pathname;
            const title = (data[0].content || data[0].textContent).trim();
            return new Manga(this, id, title);
        } else {
            throw new Error('Only doujins are supported, galleries cannot be downloaded!');
        }
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/api/doujinshi/?format=json&limit=100', this.url).href;
        let run = true;
        while(run) {
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchJSON(request, 3);
            mangaList.push( ...data.results.map(element => {
                return {
                    id: `/doujinshi/${element.slug}`,
                    title: element.name
                };
            }));
            uri = data.next;
            run = uri != null;
        }
        return mangaList;
    }

    async _getChapters(manga) {
        return [{
            id: manga.id,
            title: manga.title,
            language: ''
        }];
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'v-img[lazy-src]', 3);
        return data.map(element => {
            return this.getAbsolutePath(element.attributes.src.value, this.url);
        });
    }
}
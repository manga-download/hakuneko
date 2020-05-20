import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaCross extends Connector {

    constructor() {
        super();
        super.id = 'mangacross';
        super.label = 'MangaCross';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://mangacross.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname.split('/').pop();
        let title = data[0].textContent.split('|')[0].trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL('/api/comics.json', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.comics.map(comic => {
            return {
                id: comic.dir_name,
                title: comic.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL('/api/comics/' + manga.id + '.json', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        // Is there a way to access the "private" chapters ? Logging in didn't change anything...
        return data.comic.episodes.filter(episode => episode.status == 'public').map(episode => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(episode.page_url, this.url),
                title: episode.volume.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id + '/viewer.json', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.episode_pages.map(page => this.createConnectorURI(this.getAbsolutePath(page.image.pc_url, this.url)));
    }
}
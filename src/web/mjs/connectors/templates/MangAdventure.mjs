import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class MangAdventure extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.requestOptions.headers.set('x-user-agent', this.userAgent);
    }

    get platform() {
        switch (process.platform) {
            case 'win32':
            case 'cygwin':
                return 'Windows';
            case 'linux':
                return 'Linux';
            case 'darwin':
                return 'Macintosh';
            default:
                return process.platform;
        }
    }

    get userAgent() {
        return `Mozilla/5.0 (${this.platform}) Chrome/${process.versions.chrome} Hakuneko`;
    }

    apiRequest(path) {
        const url = new URL('/api/v2' + path, this.url);
        return new Request(url, this.requestOptions);
    }

    canHandleURI(uri) {
        return this.url == uri.origin && uri.pathname.startsWith('/reader/');
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.match(/^\/reader\/([^/]+)/)[1];
        const request = this.apiRequest(`/series/${slug}`);
        const { title } = await this.fetchJSON(request);
        return new Manga(this, slug, title);
    }

    async _getMangas() {
        const request = this.apiRequest('/series?limit=999');
        const { results } = await this.fetchJSON(request);
        return results.filter(series => series.chapters).map(series => ({
            id: series.slug,
            title: series.title
        }));
    }

    async _getChapters(manga) {
        const request = this.apiRequest(`/series/${manga.id}/chapters`);
        const { results } = await this.fetchJSON(request);
        return results.map(chapter => ({
            id: chapter.id.toString(),
            title: chapter.full_title,
            language: ''
        }));
    }

    async _getPages(chapter) {
        const request = this.apiRequest(`/chapters/${chapter.id}/pages?track=true`);
        const { results } = await this.fetchJSON(request);
        return results.map(page => page.image);
    }
}

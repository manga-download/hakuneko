import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class WordPressMadara extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.path = '';

        this.queryMangas = 'div.post-title h3 a, div.post-title h5 a';
        this.queryChapters = 'li.wp-manga-chapter > a';
        this.queryPages = 'div.page-break source';
        this.queryTitleForURI = 'head meta[property="og:title"]';
    }

    _createMangaRequest(page) {
        let form = new URLSearchParams();
        form.append('action', 'madara_load_more');
        form.append('template', 'madara-core/content/content-archive');
        form.append('page', page);
        form.append('vars[paged]', '0');
        form.append('vars[post_type]', 'wp-manga');
        form.append('vars[posts_per_page]', '250');
        // inject `madara.query_vars` into any website using wp-madara to see full list of supported vars

        this.requestOptions.method = 'POST';
        this.requestOptions.body = form.toString();
        let request = new Request(new URL(this.path + '/wp-admin/admin-ajax.php', this.url), this.requestOptions);
        request.headers.set('content-type', 'application/x-www-form-urlencoded');
        request.headers.set('x-referer', this.url);
        this.requestOptions.method = 'GET';
        delete this.requestOptions.body;
        return request;
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = this._createMangaRequest(page);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let dom = (await this.fetchDOM(request, 'body'))[0];
        let data = [...dom.querySelectorAll(this.queryChapters)];
        let placeholder = dom.querySelector('[id^="manga-chapters-holder"][data-id]');
        if (placeholder) {
            let uri = new URL(this.path + '/wp-admin/admin-ajax.php', this.url);
            let request = new Request(uri, {
                method: 'POST',
                body: 'action=manga_get_chapters&manga=' + placeholder.dataset.id,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-referer': this.url
                }
            });
            data = await this.fetchDOM(request, this.queryChapters);
        }
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        // TODO: setting this parameter seems to be problematic for various website (e.g. ChibiManga, AniMangaES server will crash)
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            if (element.src.includes('data:image')) {
                return element.src.match(/data:image[^\s'"]*/)[0];
            } else {
                return this.createConnectorURI({
                    // HACK: bypass 'i0.wp.com' image CDN to ensure original images are loaded directly from host
                    url: this.getAbsolutePath(element.dataset['src'] || element['srcset'] || element, request.url).replace(/\/i\d+\.wp\.com/, ''),
                    referer: request.url
                });
            }
        });
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryTitleForURI);
        const element = [...data].pop();
        const title = (element.content || element.textContent).trim();
        return new Manga(this, uri, title);
    }
}
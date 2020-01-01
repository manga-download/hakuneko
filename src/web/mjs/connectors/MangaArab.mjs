import Connector from '../engine/Connector.mjs';

export default class MangaArab extends Connector {

    constructor() {
        super();
        super.id = 'mangaarab';
        super.label = 'مانجا العرب (Manga Al-arab)';
        this.tags = ['manga', 'arabic'];
        this.url = 'https://mangaae.com';
    }

    _getMangaListFromPages(mangaPageLinks, index) {
        if (index === undefined) {
            index = 0;
        }
        return this.wait(0)
            .then(() => this.fetchDOM(mangaPageLinks[index], 'div#mangadirectory div.mangacontainer a.manga', 5))
            .then(data => {
                let mangaList = data.filter((element, index) => {
                    /*
                     * even link is manga with english title, odd link is same manga but arabic title
                     *return index % 2 === 0; // english
                     */
                    return index % 2 === 1; // arabic
                }).map(element => {
                    return {
                        id: this.getRelativeLink(element),
                        title: element.text.trim()
                    };
                });
                if (index < mangaPageLinks.length - 1) {
                    return this._getMangaListFromPages(mangaPageLinks, index + 1)
                        .then(mangas => mangas.concat(mangaList));
                } else {
                    return Promise.resolve(mangaList);
                }
            });
    }

    _getMangaList(callback) {
        this.fetchDOM(this.url + '/manga', 'div.pagination a:last-of-type')
            .then(data => {
                let pageCount = parseInt(data[0].text.trim());
                let pageLinks = [... new Array(pageCount).keys()].map(page => this.url + '/manga/page:' + (page + 1) + '|order:english_name');
                return this._getMangaListFromPages(pageLinks);
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                console.error(error, this);
                callback(error, undefined);
            });
    }

    _getChapterList(manga, callback) {
        this.fetchDOM(this.url + manga.id, 'div.indexcontainer ul.new-manga-chapters li a.chapter')
            .then(data => {
                let chapterList = data.map(element => {
                    return {
                        id: this.getRelativeLink(element).replace(/\d+\/?$/, '0/full'),
                        title: element.text.trim(),
                        language: 'ae'
                    };
                });
                callback(null, chapterList);
            })
            .catch(error => {
                console.error(error, manga);
                callback(error, undefined);
            });
    }

    _getPageList(manga, chapter, callback) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        this.fetchDOM(request, 'div#showchaptercontainer source')
            .then(data => {
                let pageList = data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
                callback(null, pageList);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }

    _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', payload);
        let promise = super._handleConnectorURI(payload);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}
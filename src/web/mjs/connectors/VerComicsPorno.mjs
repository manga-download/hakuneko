import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class VerComicsPorno extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'vercomicsporno';
        super.label = 'VerComicsPorno';
        this.tags = ['manga', 'comics' ,'spanish', 'english'];
        this.url = 'http://vercomicsporno.com';
        this.path = '/page'
        this.queryComics = '#posts .gallery > a';
        this.queryPages = 'ul.pagination li:last-of-type a';
        this.listPages = '#posts source.lazy:not(:last-child)'
    }

    /**
     *
     */
    async _getMangaListFromPages(mangaPageLinks, index) {
        index = index || 0;
        let request = new Request(mangaPageLinks[index], this.requestOptions);
        return this.fetchDOM(request, this.queryComics, 5)
            .then(data => {
                let mangaList = data.map(element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                        // id: this.element.href.split('/').pop(),
                        title: element.text.trim()
                    };
                });
                if (index < mangaPageLinks.length - 1) {
                    return this._getMangaListFromPages(mangaPageLinks, index + 1)
                        .then(mangas => mangaList.concat(mangas));
                } else {
                    return Promise.resolve(mangaList);
                }
            });
    }

    /**
     *
     */
    _getMangaList(callback) {
        let request = new Request(this.url + this.path + '/1', this.requestOptions);
        this.fetchDOM(request, this.queryPages)
            .then(data => {
                let uriCount = data[0].href.split('/')
                let pageCount =parseInt(uriCount[uriCount.length - 1]);
                let pageLinks = [...(new Array(pageCount)).keys()].map(page => this.url + this.path + '/' + (page + 1));
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

    /**
     *
     */
    _getChapterList(manga, callback) {
        Promise.resolve()
            .then(() => {
                let chapterList = [{
                    id: manga.id,
                    title: manga.title,
                    language: ''
                }];
                callback(null, chapterList);
            })
            .catch(error => {
                console.error(error, manga)
                callback(error, undefined)
            })
    }

    /**
     *
     */
    async _getPageList(manga, chapter, callback) {
        let request = new Request(this.url + chapter.id, this.requestOptions);

        this.fetchDOM(request, this.listPages)
            .then(data => {
                let pageList = data.map(element => {
                    return this.getAbsolutePath(element.dataset['lazySrc'] || element, request.url)
                });

                callback(null, pageList);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }

}

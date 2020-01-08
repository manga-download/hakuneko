import BloggerManga from './templates/BloggerManga.mjs';

export default class DoujinDesu extends BloggerManga {

    constructor() {
        super();
        super.id = 'doujindesu';
        super.label = 'DoujinDesu';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://www.doujindesu.ch';
        this.urlBlog = 'https://doujindesu.blogspot.com';

        this.path = '';
        this.feed = 'summary';
        this.queryMangasPerPage = 20;
        this.queryMangasPageCount = 'div#main div#blog-pager span.showpageNum:nth-last-of-type(2) a';
    }

    _getChapterList(manga, callback) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        this.fetchDOM(request, 'div.entry-content div.dl-box div.dl-item div.dl-anime a:last-of-type')
            .then(data => {
                let chapterList = data
                    .filter(element => element.text.trim() === 'Baca Online')
                    .map(element => {
                        /*
                         * links are encrypted on client side, so we don't have to decrypt them yet
                         * this may come in the future when they are encrypted server on side
                         *let uri = new URL( element, request.url );
                         *element.href = this._decrypt( uri.searchParams.get( 'o' ).trim(), 'root', this._formatter );
                         */
                        return {
                            id: this.getRootRelativeOrAbsoluteLink(element, this.urlBlog/*request.url*/),
                            title: element.closest('div.dl-anime').childNodes[0].textContent.trim().replace(/\s*:$/, '') || manga.title,
                            language: ''
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
        this.fetchDOM(request, 'div.entry-content center source')
            .then(data => {
                let pageList = data.map(element => this.getAbsolutePath(element, request.url));
                callback(null, pageList);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }

    /**
     ****************************
     * ** DOUJINDESU CODE BEGIN ***
     ***************************
     */

    get _formatter() {
        return {
            prefix: '',
            stringify: function (t) {
                var r = this.prefix;
                return r += t.salt.toString(), r += t.ciphertext.toString();
            },
            parse: function (t) {
                var r = CryptoJS.lib.CipherParams.create({}), e = this.prefix.length;
                return 0 !== t.indexOf(this.prefix) ? r : (r.ciphertext = CryptoJS.enc.Hex.parse(t.substring(16 + e)), r.salt = CryptoJS.enc.Hex.parse(t.substring(e, 16 + e)), r);
            }
        };
    }

    _decrypt(r, e, t) {
        try {
            var n = CryptoJS.AES.decrypt(r, e, {
                format: t.formatter
            });
            return n.toString(CryptoJS.enc.Utf8);
        } catch (i) {
            return '';
        }
    }

    /**
     **************************
     * ** DOUJINDESU CODE END ***
     *************************
     */
}
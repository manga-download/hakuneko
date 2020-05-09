import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OnePunchMan extends Connector {

    constructor() {
        super();
        super.id = 'wanpaman';
        super.label = 'Wan-Pa Man';
        this.tags = [ 'manga', 'japanese'];
        this.url = 'http://galaxyheavyblow.web.fc2.com';
    }

    async _getMangas() {
        return [
            {
                id: this.url,
                title: this.label
            }
        ];
    }

    async _getChapterList(manga, callback) {
        let request = new Request(new URL(manga.id), this.requestOptions);

        Engine.Request.fetchUI( request, 'new XMLSerializer().serializeToString(document);' )
            .then( data => {
                let chapters = [];
                data = this.createDOM(data).querySelectorAll('body a');
                for (let link of data) {
                    if ( link.pathname.includes('imageviewer') ) {
                        chapters.push(
                            {
                                id: this.getRootRelativeOrAbsoluteLink(link.href.replace('hakuneko://cache/', '/'), this.url),
                                title: link.text
                            }
                        );
                    }
                }
                callback(null, chapters.reverse());
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            });
    }

    async _getPageList(manga, chapter, callback) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(new XMLSerializer().serializeToString(document));
                    } catch(error) {
                        reject(error);
                    }
                }, 3000);
            });
        `;

        Engine.Request.fetchUI( request, script )
            .then( data => {
                let pages = [];
                data = this.createDOM(data).querySelectorAll('div.image_item source');

                for (let image of data) {
                    pages.push(this.getAbsolutePath(image.getAttribute('data-original'), this.url));
                }
                callback(null, pages );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            });
    }

    async _getMangaFromURI() {
        return new Manga(this, this.url, this.label);
    }
}
import Connector from '../engine/Connector.mjs';

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
                let chapters = []
                    data = this.createDOM(data).querySelectorAll('body a')

                    for (let link of data) {
                        if ( link.pathname.includes('imageviewer') ) {
                            chapters.push(
                                {
                                    id: this.getRootRelativeOrAbsoluteLink(link.href.replace('hakuneko://cache/', '/'), this.url),
                                    title: link.text
                                }
                            )
                        }
                    }
                callback(null, chapters);
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            }
        );
    }
}
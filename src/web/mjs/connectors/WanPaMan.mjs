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

    async _getPages(chapter) {
        let aid = chapter.id.match(/(?:aid=)(\d+)/)[1];
        let iid = chapter.id.match(/(?:iid=)(\d+)/)[1];
        let path = '/' + chapter.id.match(/\/(.+)\//)[1] + '/';

        let request = new Request(
            new URL(
                path + aid + '/' + iid + '/metadata.json?_=' + Math.round(new Date().getTime()),
                this.url
            ),
            this.requestOptions
        );
        let data = await this.fetchJSON(request);

        return data.imageItemList.map(page => {
            return this.getAbsolutePath(path+ + aid + '/' + iid + '/' + page.fileName, this.url);
        });

    }

    async _getMangaFromURI() {
        return new Manga(this, this.url, this.label);
    }
}
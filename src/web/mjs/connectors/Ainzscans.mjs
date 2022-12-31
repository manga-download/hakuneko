import Connector from '../engine/Connector.mjs';

export default class Ainzscans extends Connector {

    constructor() {
        super();
        super.id = 'ainzscans';
        super.label = 'Ainz Scans';
        this.tags = [ 'webtoon', 'indonesian', 'scanlation' ];
        this.url = 'https://www.ainzscans.my.id';
    }

    async _getMangas() {
        const uri = new URL('/feeds/posts/default/-/Series?alt=json&max-results=500', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.feed.entry.map(entry => {
            return {
                id: this.getRootRelativeOrAbsoluteLink( entry.link.find( a => a.rel === 'alternate' ).href, request.url ),
                title: entry.title['$t'].trim()
            };
        });
    }

    async _getChapters(manga) {
    	  const uri = new URL(manga.id, this.url);
    	  let script = `
          new Promise(resolve => {
            resolve(label_chapter);
        });
        `;
        let request = new Request(uri);
        const data = await Engine.Request.fetchUI(request, script, 5000);

        const apiuri = new URL('/feeds/posts/default/-/'+data+'?alt=json&max-results=500', this.url);
        request = new Request(apiuri, this.requestOptions);
        const feeds = await this.fetchJSON(request);
        return feeds.feed.entry
            .filter(entry => entry.title['$t'].trim() != data )
            .map(entry => {
                return {
                    id: entry.id['$t'],
                    title: entry.title['$t'].trim()
                };
            });
    }
    async _getPages(chapter) {
    	let uri = new URL(chapter.manga.id, this.url);
    	  let script = `
          new Promise(resolve => {
            resolve(label_chapter);
        });
        `;
        let request = new Request(uri);
        let data = await Engine.Request.fetchUI(request, script, 5000);

        uri = new URL('/feeds/posts/default/-/'+data+'?alt=json&max-results=500', this.url);
        request = new Request(uri, this.requestOptions);
        const feeds = await this.fetchJSON(request);
        const goodchap = feeds.feed.entry.find( a => a.id['$t'] == chapter.id);
        const pictures = this.createDOM(goodchap.content['$t']).querySelectorAll('source');
        return Array.from(pictures).map(entry => this.getRootRelativeOrAbsoluteLink(entry.dataset['src'] || entry.src, this.url));
    }
}
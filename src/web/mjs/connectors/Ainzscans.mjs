import Connector from '../engine/Connector.mjs';

export default class Ainzscans extends Connector {

    constructor() {
        super();
        super.id = 'ainzscans';
        super.label = 'Ainz Scans';
        this.tags = [ 'webtoon', 'indonesian', 'scanlation' ];
        this.url = 'https://www.ainzscans.my.id';
        this.resultsPerPages = 500;
    }

    async _getMangas() {
        let mangalist = [];
        let uri = new URL('/feeds/posts/default/-/Series?alt=json&max-results='+this.resultsPerPages, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        const totalentries = parseInt(data.feed.openSearch$totalResults['$t']);
        let numpages = Math.floor(totalentries / this.resultsPerPages);
        numpages == 0 ? numpages++ : numpages;
        for (let page = 0; page < numpages; page++) {
            uri = new URL('/feeds/posts/default/-/Series?alt=json&max-results=500&start-index='+ page * this.resultsPerPages+1, this.url);
            request = new Request(uri, this.requestOptions);
            let data = await this.fetchJSON(request);

            data.feed.entry.forEach(entry => {
                mangalist.push( {
                    id: this.getRootRelativeOrAbsoluteLink( entry.link.find( a => a.rel === 'alternate' ).href, request.url ),
                    title: entry.title['$t'].trim()
                });
            });

        }
        return mangalist;
    }

    async _getChapters(manga) {
        let chapterlist = [];
        const uri = new URL(manga.id, this.url);
        const script = `
          new Promise(resolve => {
            resolve(label_chapter);
        });
        `;
        let request = new Request(uri);
        const chapterSlang = await Engine.Request.fetchUI(request, script, 5000);

        let apiuri = new URL('/feeds/posts/default/-/'+chapterSlang+'?alt=json&max-results='+this.resultsPerPages, this.url);
        request = new Request(apiuri, this.requestOptions);
        let feeds = await this.fetchJSON(request);
        const totalentries = parseInt(feeds.feed.openSearch$totalResults['$t']);
        let numpages = Math.floor(totalentries / this.resultsPerPages);
        numpages == 0 ? numpages++ : numpages;

        for (let page = 0; page < numpages; page++) {
            apiuri = new URL('/feeds/posts/default/-/'+chapterSlang+'?alt=json&max-results='+this.resultsPerPages+'&start-index='+ page * this.resultsPerPages+1, this.url);
            request = new Request(apiuri, this.requestOptions);
            let data = await this.fetchJSON(request);

            data.feed.entry.forEach(entry => {
                const entrylink = entry.link.find( a => a.rel === 'alternate' ).href;
                if (entrylink != uri ) {
                    chapterlist.push( {
                        id: entry.id['$t'],
                        title: entry.title['$t'].trim()
                    });
                }

            });

        }
        return chapterlist;
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.manga.id, this.url);
        const script = `
          new Promise(resolve => {
            resolve(label_chapter);
        });
        `;
        let request = new Request(uri);
        const chapterSlang = await Engine.Request.fetchUI(request, script, 5000);

        uri = new URL('/feeds/posts/default/-/'+chapterSlang+'?alt=json', this.url);
        request = new Request(uri, this.requestOptions);
        const feeds = await this.fetchJSON(request);
        const goodchap = feeds.feed.entry.find( a => a.id['$t'] == chapter.id);
        const pictures = this.createDOM(goodchap.content['$t']).querySelectorAll('source');
        return Array.from(pictures).map(entry => this.getRootRelativeOrAbsoluteLink(entry.dataset['src'] || entry.src, this.url));
    }
}

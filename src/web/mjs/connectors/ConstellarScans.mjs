import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class ConstellarScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'constellarscans';
        super.label = 'Constellar Scans';
        this.tags = [ 'webtoon', 'english', 'hentai', 'scanlation' ];
        this.url = 'https://constellarscans.com';
        this.path = '/manga/list-mode/';
        this.queryPages = 'div#reader_area img[src]:not([src=""])';
    }

    async _initializeConnector() {
    // for some reasons, fetchui never ends and we reach timeout. I have to put an empty _initializeConnector
    }

    async _getPages(chapter) {
        try {
            const uri = new URL(chapter.id, this.url);
            let request = new Request(uri, this.requestOptions);
            let data = await fetch(request);
            data = await data.text();

            let tsrundata = data.match(/ts_rea_der_\._run\(['"]([\S]+)['"]/)[1];
            const ts_reader = JSON.parse(this.decrypt(tsrundata));
            return ts_reader.sources.shift().images;
        } catch(error) {
            return await super._getPages(chapter); //fallback with corrected queryPages
        }
    }

    decrypt(payload) {
        for (
            var var1 = '', var2 = '', var3 = 0, var4 = 0, charset = '', i = 32;// INIT
            i < 126; //CHECK
            i++// INC
        ) {
            charset += window.String.fromCodePoint(i);
        }

        for (i = 0; i < payload.length; i++) {
            +payload[i] > -1 &&
        (var3 += +payload[i],
        (var4 + 1) % 2 == 0 &&
          (var1 += var3 + '',
          var3 = 0,
          var1.length > 1 && (var2 += charset[+var1], var1 = '')),
        var4++);
        }
        return var2;
    }
}

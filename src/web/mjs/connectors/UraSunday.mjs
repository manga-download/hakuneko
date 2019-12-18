import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class UraSunday extends Connector {

    constructor() {
        super();
        super.id = 'urasunday';
        super.label = '裏サンデー (Ura Sunday)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://urasunday.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.title div.detail div.info h1');
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of ['/serial_title', '/complete_title']) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.title-all-list ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('source').getAttribute('alt').split('「').pop().split('」').shift()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.title div.detail div.chapter ul li a');
        return data.filter(element => !element.href.includes('info.php')).map(element => {
            let number = element.querySelector('div > div:first-of-type').textContent.trim();
            let title = element.querySelector('div > div:nth-of-type(2)').textContent.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: (number + ' - ' + title).trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();

        let images = undefined;

        try {
            images = await this._extractZao(data);
        } catch(error) {
            //
        }
        try {
            images = await this._extractComicWrite(data);
        } catch(error) {
            //
        }
        try {
            images = await this._extractWebarena(data);
        } catch(error) {
            //
        }
        try {
            images = await this._extractWebarenaNew(data, request.url);
        } catch(error){
            //
        }
        try {
            images = await this._extractWebarenaMapon(data);
        } catch(error) {
            //
        }

        if(!images) {
            throw new Error('Failed to extract images, maybe provider not supported!');
        }

        return images;
    }

    _extractZao( data ) {
        // https://urasunday.com/dist/js/zao.js
        if(data.includes('dist/js/zao.js')) {
            let images = [];
            let match = undefined;
            let regex = new RegExp(/src:\s*['"]([^'"]+)['"]/g);
            // eslint-disable-next-line no-cond-assign
            while(match = regex.exec(data)) {
                images.push(this.getAbsolutePath(match[1], this.url));
            }
            return Promise.resolve(images);
        } else {
            return Promise.reject();
        }
    }

    _extractComicWrite( data ) {
        // https://urasunday.com/js/comic_write171201.js
        if( data.includes( '../js/comic_write' ) ) {
            let images = JSON.parse( data.match( /data\s*=\s*JSON\.parse\s*\(\s*'(.*)'/ )[1] );
            return Promise.resolve( images );
        } else {
            return Promise.reject();
        }
    }

    _extractWebarena( data ) {
        // https://webarena.tokyo-cdn.com/urasunday/js/comic_write.js
        if( data.includes( 'urasunday/js/comic_write.js' ) ) {
            let base = 'https://webarena.tokyo-cdn.com/urasunday/manga/comic';
            let comic = data.match( /comic\s*=\s*['"]([^'"]+)['"]/ )[1];
            let type = 'pc'; // 'mobile' // data.match( /type\s*=\s*['"]([^'"]+)['"]/ )[1];
            let imgid = data.match( /imgid\s*=\s*['"]([^'"]+)['"]/ )[1];
            let subpath = imgid.split( '_' )[0];
            let ext = '.jpg';
            let max = parseInt( data.match( /comicMax\s*=\s*(\d+)/ )[1] );

            let images = [... new Array( max ).keys()].map( page => {
                let index = page + 1;
                index = index < 10 ? '0' + index : index;
                return [ base, comic, type, subpath, imgid + '_' + index + ext ].join( '/' );
            } );
            return Promise.resolve( images );
        } else {
            return Promise.reject();
        }
    }

    _extractWebarenaNew( data, referer ) {
        // https://webarena.tokyo-cdn.com/urasunday/js/comic_write_new.js
        if( data.includes( 'urasunday/js/comic_write_new.js' ) ) {
            let base = 'https://tokyo-cdn.com/image/jpeg.php?page=';
            let max = parseInt( data.match( /comicMax\s*=\s*(\d+)/ )[1] );
            let imgid = data.match( /imgid\s*=\s*['"]([^'"]+)['"]/ )[1];

            this.requestOptions.method = 'POST';
            this.requestOptions.body = 'chapter=' + imgid;
            let request = new Request( this.url + '/set_token.php', this.requestOptions );
            request.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
            request.headers.set( 'x-referer', referer );
            this.requestOptions.method = 'GET';
            delete this.requestOptions.body;

            return fetch( request )
                .then( response => response.text() )
                .then( token => {
                    let images = [... new Array( max ).keys()].map( page => {
                        let index = page + 1;
                        return base + index + token;
                    } );
                    return Promise.resolve( images );
                } );
        } else {
            return Promise.reject();
        }
    }

    _extractWebarenaMapon( data ) {
        // https://webarena.tokyo-cdn.com/urasunday/js/comic_write_mapon.js
        if( data.includes( 'urasunday/js/comic_write_mapon.js' ) ) {
            return this._extractWebarena( 'urasunday/js/comic_write.js' + data );
        } else {
            return Promise.reject();
        }
    }
}
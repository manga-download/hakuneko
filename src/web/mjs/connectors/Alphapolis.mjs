import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Alphapolis extends Connector {

    constructor() {
        super();
        super.id = 'alphapolis';
        super.label = 'ALPHAPOLIS (アルファポリス)';
        this.tags = ['manga', 'japanese', 'hentai'];
        this.url = 'https://www.alphapolis.co.jp';
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL('/manga/official/search', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'span:last-child > a');
        const pageCount = parseInt(data[0].href.match(/(\d)+$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/manga/official/search?page=${page}`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.official-manga-panel > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.title').textContent.replace('[R18]', '').trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.manga-detail-description > div.title');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        const script = `
            var _0x5012=['WOrFCSkq','W4NdUfK=','WP1BFSkhWO0=','W78rE3vjW5lcHW==','W4tcU8kEWOlcUG==','W5vyvrddMxOTW6pcKG==','w0ldKCogeLVdGmkijCkedSkIDCkUwSk2WPxcQmoKWOjRjCkCWRCSgGm='];(function(_0x1225c6,_0x5012b3){var _0x5e03e4=function(_0x138c07){while(--_0x138c07){_0x1225c6['push'](_0x1225c6['shift']());}};_0x5e03e4(++_0x5012b3);}(_0x5012,0x11a));var _0x5e03=function(_0x1225c6,_0x5012b3){_0x1225c6=_0x1225c6-0x0;var _0x5e03e4=_0x5012[_0x1225c6];if(_0x5e03['eKfTmD']===undefined){var _0x138c07=function(_0x57a40b){var _0x350a78='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=',_0x32282b=String(_0x57a40b)['replace'](/=+$/,'');var _0x4f83c6='';for(var _0x52bde4=0x0,_0x3eec1b,_0xbdcf31,_0x52be32=0x0;_0xbdcf31=_0x32282b['charAt'](_0x52be32++);~_0xbdcf31&&(_0x3eec1b=_0x52bde4%0x4?_0x3eec1b*0x40+_0xbdcf31:_0xbdcf31,_0x52bde4++%0x4)?_0x4f83c6+=String['fromCharCode'](0xff&_0x3eec1b>>(-0x2*_0x52bde4&0x6)):0x0){_0xbdcf31=_0x350a78['indexOf'](_0xbdcf31);}return _0x4f83c6;};var _0x48deab=function(_0x58d5e0,_0x479064){var _0x2b7425=[],_0x1e8dd5=0x0,_0x436c7a,_0x103faf='',_0x289431='';_0x58d5e0=_0x138c07(_0x58d5e0);for(var _0x471ec8=0x0,_0x1c67fe=_0x58d5e0['length'];_0x471ec8<_0x1c67fe;_0x471ec8++){_0x289431+='%'+('00'+_0x58d5e0['charCodeAt'](_0x471ec8)['toString'](0x10))['slice'](-0x2);}_0x58d5e0=decodeURIComponent(_0x289431);var _0x2dc407;for(_0x2dc407=0x0;_0x2dc407<0x100;_0x2dc407++){_0x2b7425[_0x2dc407]=_0x2dc407;}for(_0x2dc407=0x0;_0x2dc407<0x100;_0x2dc407++){_0x1e8dd5=(_0x1e8dd5+_0x2b7425[_0x2dc407]+_0x479064['charCodeAt'](_0x2dc407%_0x479064['length']))%0x100,_0x436c7a=_0x2b7425[_0x2dc407],_0x2b7425[_0x2dc407]=_0x2b7425[_0x1e8dd5],_0x2b7425[_0x1e8dd5]=_0x436c7a;}_0x2dc407=0x0,_0x1e8dd5=0x0;for(var _0x5f4041=0x0;_0x5f4041<_0x58d5e0['length'];_0x5f4041++){_0x2dc407=(_0x2dc407+0x1)%0x100,_0x1e8dd5=(_0x1e8dd5+_0x2b7425[_0x2dc407])%0x100,_0x436c7a=_0x2b7425[_0x2dc407],_0x2b7425[_0x2dc407]=_0x2b7425[_0x1e8dd5],_0x2b7425[_0x1e8dd5]=_0x436c7a,_0x103faf+=String['fromCharCode'](_0x58d5e0['charCodeAt'](_0x5f4041)^_0x2b7425[(_0x2b7425[_0x2dc407]+_0x2b7425[_0x1e8dd5])%0x100]);}return _0x103faf;};_0x5e03['YyIaTO']=_0x48deab,_0x5e03['hTxvhs']={},_0x5e03['eKfTmD']=!![];}var _0x309aea=_0x5e03['hTxvhs'][_0x1225c6];return _0x309aea===undefined?(_0x5e03['qLtoxU']===undefined&&(_0x5e03['qLtoxU']=!![]),_0x5e03e4=_0x5e03['YyIaTO'](_0x5e03e4,_0x5012b3),_0x5e03['hTxvhs'][_0x1225c6]=_0x5e03e4):_0x5e03e4=_0x309aea,_0x5e03e4;};var _0x34e597=_0x5e03;new Promise(_0x138c07=>_0x138c07($(_0x34e597('0x4','3O%j'))[_0x34e597('0x5','OenM')]()[_0x34e597('0x0','OenM')](/push.['"](http[^'"]+)['"]/g)[_0x34e597('0x6','yqs9')](_0x309aea=>_0x309aea[_0x34e597('0x2','z6Dy')]('\x22')[0x1][_0x34e597('0x1','WmhG')](/[0-9]+x[0-9]+/,_0x34e597('0x3','3chS')))));
        `;
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.episode-unit');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.read-episode'), this.url),
                title: element.querySelector('div.title').textContent.trim()
            };
        });
    }
}
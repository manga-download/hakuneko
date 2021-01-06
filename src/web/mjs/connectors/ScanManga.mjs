import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ScanManga extends Connector {

    constructor() {
        super();
        super.id = 'scanmanga';
        super.label = 'ScanManga';
        this.tags = ['manga', 'french', 'novel'];
        this.url = 'https://www.scan-manga.com';
        var _0x1087 = ['381sfGWON', '916955zZjSQL', '31ElJoip', '708qNyAYT', '2ayDZDy', 'accept-language', 'set', '2RuRNTr', '681974vvHWEX', '71297ucZdkv', '19023wnFPih', 'headers', '1EktpzL', 'requestOptions', '2315QJlMKR', '765166pfLgfQ', 'en-US', '2469XKKoaj']; var _0x3907 = function (_0x376230, _0x20d038) { _0x376230 = _0x376230 - 0x1be; var _0x1087ed = _0x1087[_0x376230]; return _0x1087ed; }; var _0x59f72d = _0x3907; (function (_0x6ca478, _0x265693) { var _0x302037 = _0x3907; while (!![]) { try { var _0x5c9580 = parseInt(_0x302037(0x1bf)) * -parseInt(_0x302037(0x1c4)) + parseInt(_0x302037(0x1c3)) * parseInt(_0x302037(0x1c7)) + parseInt(_0x302037(0x1ce)) + -parseInt(_0x302037(0x1cf)) * -parseInt(_0x302037(0x1c5)) + -parseInt(_0x302037(0x1ca)) * -parseInt(_0x302037(0x1c2)) + parseInt(_0x302037(0x1c9)) * -parseInt(_0x302037(0x1be)) + -parseInt(_0x302037(0x1cd)) * parseInt(_0x302037(0x1cc)); if (_0x5c9580 === _0x265693) break; else _0x6ca478['push'](_0x6ca478['shift']()); } catch (_0x5bf218) { _0x6ca478['push'](_0x6ca478['shift']()); } } }(_0x1087, 0xf353f), this[_0x59f72d(0x1c8)][_0x59f72d(0x1c6)][_0x59f72d(0x1c1)](_0x59f72d(0x1c0), _0x59f72d(0x1cb)));
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.texte_volume_manga ul li.chapitre div.chapitre_nom');
        return data
            .filter(element => element.querySelector('a:first-of-type[href]'))
            .map(element => {
                let anchor = element.querySelector('a:first-of-type');
                return {
                    id: this.getRootRelativeOrAbsoluteLink(anchor, this.url),
                    title: element.textContent.trim(),
                    language: ''
                };
            });
    }

    async _getPagesManga(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        let baseURL = data.match(/['"](https?:\/\/lel\.scan-manga\.com:\d+\/.*?\/\d+\/\d+\/.*?)['"]/)[1];
        let regex = /['"](.*?zoneID.*?pageID.*?siteID.*?)['"]/g;
        let pageList = [];
        let match = undefined;
        // eslint-disable-next-line no-cond-assign
        while (match = regex.exec(data)) {
            pageList.push(match[1]);
        }
        return pageList.map(link => this.createConnectorURI({
            url: baseURL + link,
            referer: request.url
        }));
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.aLN');
        return data.length > 0 ? this._getPagesNovel(request) : this._getPagesManga(chapter);
    }

    async _getPagesNovel(request) {
        let script = `
            new Promise((resolve, reject) => {
                document.body.style.width = '56em';
                let novel = document.querySelector('article.aLN');
                novel.style.padding = '1.5em';
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try{
                        let canvas = await html2canvas(novel);
                        resolve(canvas.toDataURL('image/png'));
                    }catch (error){
                        reject(error)
                    }
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;
        return [await Engine.Request.fetchUI(request, script)];
    }

    _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', payload.referer);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}

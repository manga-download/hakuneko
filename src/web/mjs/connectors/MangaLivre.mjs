import Leitor from './Leitor.mjs';

export default class MangaLivre extends Leitor {

    constructor() {
        super();
        super.id = 'mangalivre';
        super.label = 'Manga Livre';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://mangalivre.net';
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const dom = await this.fetchDOM(request);
        const script = dom.querySelector('script[src*="token="]');
        const source = new URL(script.src);
        const release = source.searchParams.get('id_release');
        const token = source.searchParams.get('token');
        const ivRegEx = /new\s+Reader\s*\((?:\s*\w+\s*,){3}\s*"([a-fA-F0-9]+)"\s*\)/;
        const iv = [...dom.querySelectorAll('script')].find(script => ivRegEx.test(script.text)).text.match(ivRegEx)[1];
        return this._getImageLinks(release, this._key(token, iv, release));
    }

    _key(e, t, i) {
        var o = Math.max(i % 7, 1)
            , a = t.match(/.{1,5}/gi);
        t = (t = a.slice(o).concat(a.slice(0, o)).join("")).split("");
        var s = e.split("").reverse()
            , c = e.split("").sort(function() {
                return Math.random() - .5;
            })
            , u = e.split("").sort(function() {
                return Math.random() - .5;
            });
        return e.split("").reduce(function(e, n, r) {
            return e + u[r] + n + s[r] + t[r] + c[r];
        }, "").match(new RegExp(".{1," + Math.max(i % 11, 1) + "}", "gi")).map(e => {
            return this.r(Math.max(i % 7, 1)) + e;
        }).join("");
    }

    r(e) {
        const r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var t = "", n = r.length, i = 0; i < e; i++)
            t += r.charAt(Math.floor(Math.random() * n));
        return t;
    }
}
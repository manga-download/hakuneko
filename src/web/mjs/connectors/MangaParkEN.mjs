import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// Very similar to AnyACG (e.g. bato.to)
export default class MangaParkEN extends Connector {

    constructor() {
        super();
        super.id = 'mangapark-en';
        super.label = 'MangaPark';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangapark.net';
        this.requestOptions.headers.set('x-cookie', 'set=h=1;');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/ajax.reader.home.release', this.url);
        for (let page = '', run = true; run;) {
            const request = new Request(uri, {
                method: 'POST',
                body: JSON.stringify({ prevPos: page }),
                headers: { 'content-type': 'application/json' }
            });
            const data = await this.fetchJSON(request);
            const mangas = [...this.createDOM(data.html).querySelectorAll('div.item > div > a.fw-bold')].map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                };
            });
            mangaList.push(...mangas);
            run = !data.isLast;
            page = data.lastPos;
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let chapterList = [];
        const mangaId = manga.id.match(/\/(\d+)\/?/)[1];
        const uri = new URL('/ajax.reader.subject.episodes.by.latest', this.url);
        for (let page = '', run = true; run;) {
            const request = new Request(uri, {
                method: 'POST',
                body: JSON.stringify({
                    iid: mangaId,
                    prevPos: page
                }),
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            });
            const data = await this.fetchJSON(request);
            const chapters = [...this.createDOM(data.html).querySelectorAll('div.episode-item > div > a.chapt')].map(element => {
                let lang = this.getRootRelativeOrAbsoluteLink(element, this.url).match(/c[\d.]+-(\w+)-i\d+/)[1];
                if (lang)
                    lang = lang.replace(/\D(_)\D/g, (match, g1) => match.replace(g1, '-'));
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim().replace(/\s+/g, ' ') + ` (${lang})`,
                    language: lang
                };
            }).filter(chapter => chapter.language);
            chapterList.push(...chapters);
            run = data.isLast != null ? !data.isLast : false;
            page = data.lastPos;
        }
        return chapterList;
    }

    async _getPages(chapter) {
        let script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if(typeof app.items !== 'undefined') {
                        resolve(app.items.map(item => item.src || item.isrc));
                    } else {
                        const params = JSON.parse(CryptoJS.AES.decrypt(amWord, amPass).toString(CryptoJS.enc.Utf8));
                        resolve(imgHostLis.map((data, i) => \`\${data}\${imgPathLis[i]}?\${params[i]}\`));
                    }
                } catch(error) {
                    reject(error);
                }
            }, 2500);
        });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}
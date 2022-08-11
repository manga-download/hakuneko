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
        const queryMangaTitle = /\/title\/\d+/.test(uri.pathname) ? 'main h3' : 'meta[property="og:title"]';
        const data = await this.fetchDOM(request, queryMangaTitle);
        return new Manga(this, uri.pathname.match(/\/(\d+)\/?/)[1], (data[0].textContent || data[0].content).trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/browse?sort=name', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'nav.d-md-block ul.pagination li:nth-last-child(2) a');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/browse?sort=name&page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#subject-list div.item a.fw-bold');
        return data.map( element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url).match(/\/(\d+)\/?/)[1],
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const uri = new URL('/ajax.reader.subject.episodes.by.latest', this.url);
        for (let page = '', run = true; run;) {
            const request = new Request(uri, {
                method: 'POST',
                body: JSON.stringify({
                    iid: manga.id,
                    prevPos: page
                }),
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            });
            const data = await this.fetchJSON(request);
            const chapters = [...this.createDOM(data.html).querySelectorAll('div.episode-item > div > a.chapt')].map(element => {
                const link = this.getRootRelativeOrAbsoluteLink(element, this.url);
                let lang = link.match(/c[\d.]+-(\w+)-i\d+/)[1];
                if (lang)
                    lang = lang.replace(/\D(_)\D/g, (match, g1) => match.replace(g1, '-'));
                return {
                    id: link,
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
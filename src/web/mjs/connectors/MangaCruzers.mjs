import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaCruzers extends Connector {

    constructor() {
        super();
        super.id = 'mangacruzers';
        super.label = 'MangaCruzers';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangacruzers.com';
        this.uris = [
            new URL('https://manga.watchgoblinslayer.com'),
            new URL('https://manga.watchoverlord2.com'),
            new URL('https://manga.watchsao.tv'),
            new URL('https://readberserk.com'),
            new URL('https://www.dbsmanga.com'),
            new URL('https://www.demonslayermanga.com'),
            new URL('https://www.read7deadlysins.com'),
            new URL('https://www.readblackclover.com'),
            new URL('https://www.readbleachmanga.com'),
            new URL('https://www.readchainsawman.com'),
            new URL('https://www.readdrstone.com'),
            new URL('https://www.readfairytail.com'),
            new URL('https://www.readhaikyuu.com'),
            new URL('https://www.readhxh.com'),
            new URL('https://www.readjujutsukaisen.com'),
            new URL('https://www.readkaguyasama.com'),
            new URL('https://www.readkingdom.com'),
            new URL('https://www.readmha.com'),
            new URL('https://www.readnaruto.com'),
            new URL('https://www.readneverland.com'),
            new URL('https://www.readnoblesse.com'),
            new URL('https://www.readonepiece.com'),
            new URL('https://www.readopm.com'),
            new URL('https://www.readsnk.com'),
            new URL('https://www.readsololeveling.org'),
            new URL('https://www.readtowerofgod.com'),
            new URL('https://www.readvinlandsaga.com'),
            new URL('https://www.tokyoghoulre.com')
        ];
    }

    async _initializeConnector() {
        // no implementation due to collection of domains
    }

    _getTopLevelDomain(uri) {
        return uri.hostname.split('.').slice(-2).join('.');
    }

    canHandleURI(uri) {
        return this.uris.some(u => uri.hostname.includes(this._getTopLevelDomain(u)));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const domain = this._getTopLevelDomain(uri);
        let title = await this.fetchDOM(request, 'div.container > h1, div.container div.card-body h2 span, div.header-banner h1');
        title = title.find(element => /span/i.test(element.tagName)) || title.shift();
        return new Manga(this, uri.href, `[${domain}] ${title.textContent.trim()}`);
    }

    async _getMangas() {
        let mangaList = [];
        for(const uri of this.uris) {
            try {
                const mangas = await this._getMangasFromDomain(uri);
                mangaList.push(...mangas);
            } catch(error) {
                console.warn('Failed to read manga list: ' + uri.origin, error);
            }
        }
        return mangaList;
    }

    async _getMangasFromDomain(uri) {
        let mangas = [];
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, `div[class*="container"] a[class][href*="${this._getTopLevelDomain(uri)}/manga/"]`);
        data = data.map(element => this.getAbsolutePath(element, request.url));
        data = [...new Set(data)];
        if(data.length === 0) {
            data.push(uri.href);
        }
        for(let link of data) {
            mangas.push(await this._getMangaFromURI(new URL(link)));
        }
        return mangas;
    }

    async _getChapters(manga) {
        let chapterList = [];
        const data = [ manga.id ].reduce((accumulator, page) => {
            let seasons = page.match(/season-(\d+)$/);
            if(seasons) {
                let count = parseInt(seasons[1]);
                seasons = [...new Array(count).keys()].map(p => page.replace(/season-(\d+)$/, `season-${p+1}`));
                return [ ...accumulator, ...seasons.reverse() ];
            } else {
                return [ ...accumulator, page ];
            }
        }, []);
        for(let page of data) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL(page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.card-table a[href*="/chapter/"], div.w-full a[href*="/chapter/"]');
        const isTable = data.filter(element => element.text.toLowerCase() !== 'read').length === 0;
        const mangaTitle = manga.title.split(' ').slice(1).join(' ').trim();
        return data.map(element => {
            const title = isTable ? element.closest('tr').querySelector('td').textContent : element.text;
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: title.replace(mangaTitle, '').trim()
            };
        }).filter(manga => {
            const title = manga.title.toLowerCase();
            return title !== 'read' && !title.startsWith('click me');
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'source.js-page, source.pages__img');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}